import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mengambil data session auth

  // Jika session tidak ditemukan
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }


  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string) // Membuat instance GoogleGenerativeAI dari library gemini

  // @ts-ignore
  const userId = session.user.id as string // Mengambil data user id di session

  const user = await prisma.user.findUnique({ where: { id: userId } }) // Mencari user berdasarkan id

  // Jika user tidak ditemukan
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Jika user bukan premium dan sudah menggunakan AI Insight 2 kali
  if (!user.is_premium && user.aiInsightCount >= 2) {
    return {
      insight: 'Maaf, batas penggunaan AI Insight gratis (2x) sudah habis. Yuk, upgrade ke Premium untuk insight sepuasnya! ✨',
      isLimitReached: true
    }
  }

  // Mengambil data transaksi user
  const recentTx = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10
  })

  // Reformat data transaksi untuk diberi ke AI
  const txData = recentTx.map(t => `${t.date.toISOString().split('T')[0]} - ${t.type} - ${t.category || 'Lainnya'} - Rp${t.amount}`).join('\n')

  const prompt = `You are a financial advisor for Gen Z. Based on the following recent transactions, give a 2-sentence highly personalized, engaging daily insight or tip in Indonesian. Example: "Kamu sudah menghabiskan banyak anggaran makan minggu ini, kurangi jajan ya!". Transactions:\n${txData || 'Belum ada transaksi.'}`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) // Mengambil data model gemini
    const result = await model.generateContent(prompt) // Mengambil repsonse dari model gemini

    // Jika user bukan premium, tambahkan 1 ke aiInsightCount
    if (!user.is_premium) {
      await prisma.user.update({
        where: { id: userId },
        data: { aiInsightCount: { increment: 1 } }
      })
    }

    return { insight: result.response.text(), isLimitReached: false }
  } catch (err) {
    console.error('Gemini Error:', err)
    return { insight: 'Yuk, catat transaksi pertamamu untuk mendapatkan insight personal dari AI!' }
  }
})
