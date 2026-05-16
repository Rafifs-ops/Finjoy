import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'
import { randomUUID } from 'node:crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mendapatkan data auth di server
  const method = event.node.req.method // Mendapatkan method GET/POST

  // Jika menggunakan method GET
  if (method === 'GET') {
    // Mengambil data portfolio berdasarkan user id
    return prisma.portfolio.findMany({
      where: { userId: session.user.id }
    })
  }

  // Jika menggunakan method POST
  if (method === 'POST') {
    // Mengambil data dari body request
    const { type, symbol, name, quantity, buy_price } = await readBody(event)

    const amountParsed = parseFloat(quantity) // Jumlah koin/lot yang dibeli dikonversi menjadi number
    const totalPembelian = buy_price ? parseFloat(buy_price) : 0 // Total uang yang dikeluarkan

    // Simpan harga per koin/lot agar kalkulasi fallback nilai aset di frontend tetap akurat
    const buyPricePerUnit = amountParsed > 0 ? totalPembelian / amountParsed : 0

    // Menambahkan data portfolio asset crypto/saham
    const portfolio = await prisma.portfolio.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        type, // 'CRYPTO' | 'STOCK'
        symbol,
        amount: amountParsed,
        buyPrice: buyPricePerUnit,
        updatedAt: new Date()
      }
    })

    // Otomatis tambahkan data pengeluaran untuk pembelian aset
    if (totalPembelian > 0) {
      await prisma.transaction.create({
        data: {
          id: randomUUID(),
          userId: session.user.id,
          type: 'EXPENSE',
          category: type === 'STOCK' ? 'Saham' : 'Kripto',
          amount: totalPembelian,
          date: new Date(),
          description: `Beli ${type === 'STOCK' ? 'saham' : 'kripto'} ${symbol.toUpperCase()}`
        }
      })
    }

    return portfolio
  }

  // Jika menggunakan method DELETE
  if (method === 'DELETE') {
    // Mengambil data id dari body request
    const { id } = await readBody(event)

    // Menghapus data portfolio
    return prisma.portfolio.delete({
      where: { id, userId: session.user.id }
    })
  }
})
