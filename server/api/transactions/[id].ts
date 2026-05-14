import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Mengambil data session
  const session = await requireAuth(event)
  // Mengambil data transaction id dari url
  const transactionId = event.context.params?.id

  // Validasi transaction id
  if (!transactionId) {
    throw createError({ statusCode: 400, message: 'ID required' })
  }

  // Mengambil data transaksi berdasarkan id dan user id
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
      userId: session.user.id
    },
    include: { // Mengambil relasi data
      category: true,
      debt: true,
      saving: true
    }
  })

  // Jika transaksi tidak ada
  if (!transaction) {
    throw createError({ statusCode: 404, message: 'Transaction not found' })
  }

  return transaction
})
