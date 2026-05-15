import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mengambil data session auth

  const userId = session.user.id // Mengambil data user id di session

  const user = await prisma.user.findUnique({ where: { id: userId } }) // Mencari user berdasarkan id

  // Jika user tidak ditemukan
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Jika user bukan premium dan sudah menggunakan AI Chat 1 kali
  if (!user.is_premium && user.aiChatCount >= 1) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Maaf, batas penggunaan AI Chat gratis (1x) sudah habis. Yuk, upgrade ke Premium buat chat lebih banyak! 🚀'
    })
  }

  try {
    const { prompt, history } = await readBody(event) // Mengambil data prompt dan history dari body request

    // Jika user bukan premium, tambahkan 1 ke aiChatCount
    if (!user.is_premium) {
      await prisma.user.update({
        where: { id: userId },
        data: { aiChatCount: { increment: 1 } }
      })
    }

    // Jika tidak ada geminiApiKey
    if (!process.env.GEMINI_API_KEY) {
      throw createError({ statusCode: 500, statusMessage: 'Server configuration error' })
    }

    // Membuat instance GoogleGenerativeAI dari library gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

    // Mengambil data user untuk dijadikan context bagi AI
    const txs = await prisma.transaction.findMany({ where: { userId } }) // Mencari data transaksi user di db
    const income = txs.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0) // Mencari data pemasukan user lalu dijumlahkan
    const exp = txs.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0) // Mencari data pengeluaran user lalu dijumlahkan

    const ports = await prisma.portfolio.findMany({ where: { userId } }) // Mencari data portfolio user di db
    const cryptos = ports.filter(p => p.type === 'CRYPTO').map(p => `${p.amount} ${p.symbol}`).join(', ') // Mencari data crypto user lalu digabungkan
    const stocks = ports.filter(p => p.type === 'STOCK').map(p => `${p.amount} Lot ${p.symbol}`).join(', ') // Mencari data saham user lalu digabungkan

    const debts = await prisma.debt.findMany({ where: { userId } }) // Mencari data hutang user di db
    const debtList = debts.map(d => `${d.title}: Sisa Rp${d.remaining_amount}`).join(', ') // Mencari data hutang user lalu digabungkan

    const budgets = await prisma.budget.findMany({ where: { userId } }) // Mencari data budget user di db
    const budgetList = budgets.map(b => `${b.category}: Limit Rp${b.monthlyLimit}`).join(', ') // Mencari data budget user lalu digabungkan

    const systemInstruction = `Kamu adalah 'Finjoy's Assistant', konsultan keuangan pribadi Gen-Z yang santai, suportif, dan cerdas. Gunakan gaya bahasa anak muda masa kini dan emoji sewajarnya.
PENTING: Gunakan data finansial rahasia milik user ini sebagai dasar seluruh jawabanmu dan analisamu:
- Saldo Uang Tunai/Kas saat ini: Rp ${income - exp}
- Aset Kripto: ${cryptos || 'Belum punya aset kripto'}
- Aset Saham: ${stocks || 'Belum punya saham'}
- Tanggungan Hutang: ${debtList || 'Bebas hutang! Bagus!'}
- Limit Anggaran Bulan Ini: ${budgetList || 'Belum diset'}

Instruksi tambahan:
- Jangan pernah melampirkan daftar informasi di atas secara blak-blakan kecuali ditanya spesifik "Berapa kekayaanku?" atau sejenisnya.
- Gunakan data tersebut secara natural. Misal jika dia bertanya "Boleh gak aku beli sepatu 2 juta?", cek apakah Saldo uang tunainya mencukupi, lalu periksa apakah dia punya hutang yang belum dibayar. Jika berhutang, sarankan untuk melunasi hutang dulu.
- Berikan saran yang logis dan membangun secara mental.`

    // AI SDK untuk menjalankan AI (memilih model dan system instruction) 
    // Model yang digunakan adalah gemini-2.0-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction
    })

    // Jika tidak ada history, maka akan membuat chat baru
    if (!history || history.length === 0) {
      const result = await model.generateContentStream(prompt)

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder() // Meng-encode text menjadi byte array
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                controller.enqueue(encoder.encode(text)) // Meng-encode text menjadi byte array
              }
            }
          } catch (err) {
            console.error('Streaming error:', err) // Error handling
          } finally {
            controller.close() // Menutup stream
          }
        }
      })
      return stream

    } else {
      // Jika ada history, maka akan melanjutkan chat
      const chat = model.startChat({
        history: history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        }))
      })
      const result = await chat.sendMessageStream(prompt)

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                controller.enqueue(encoder.encode(text))
              }
            }
          } catch (err) {
            console.error('Streaming error:', err)
          } finally {
            controller.close()
          }
        }
      })
      return stream
    }
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    const statusCode = error.statusCode || 500
    const statusMessage = error.message.includes('429')
      ? 'Maaf, kuota harian Kelola AI sudah habis. Coba lagi besok ya! 🙏'
      : 'Ups, server AI lagi error. Coba sebentar lagi ya!'

    throw createError({
      statusCode,
      statusMessage
    })
  }
})
