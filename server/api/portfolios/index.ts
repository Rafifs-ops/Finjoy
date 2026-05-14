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

    // Membuat data portfolio
    return prisma.portfolio.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        type, // 'CRYPTO' | 'STOCK'
        symbol,
        amount: parseFloat(quantity),
        buyPrice: buy_price ? parseFloat(buy_price) : 0,
        updatedAt: new Date()
      }
    })
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
