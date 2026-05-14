import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mengambil data session

  // Validasi session
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // @ts-ignore
  const userId = session.user.id

  // Mengambil data transaksi berdasarkan user id
  const transactions = await prisma.transaction.findMany({ where: { userId } })

  // Menghitung saldo fiat
  const fiatBalance = transactions.reduce((acc, tx) => {
    return tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount
  }, 0)

  // Mengambil data portfolio berdasarkan user id
  const portfolios = await prisma.portfolio.findMany({ where: { userId } })

  // Mengambil tanggal hari ini
  const now = new Date()
  // Mengambil tanggal awal bulan ini
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  // Mengambil tanggal akhir bulan ini
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Mengambil data transaksi berdasarkan user id dan tanggal hari ini
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lt: endOfMonth
      }
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
  })

  return {
    fiatBalance,
    portfolios,
    recentTransactions
  }
})
