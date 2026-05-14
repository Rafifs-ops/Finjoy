import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Mengambil data session
  const session = await requireAuth(event)

  // Validasi session
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  // @ts-ignore
  const userId = session.user.id as string
  // @ts-ignore
  const isPremium = session.user.is_premium

  const method = event.node.req.method // Mengetahui method GET/POST

  if (method === 'GET') {
    // Mengambil data tabungan
    const savings = await prisma.saving.findMany({
      where: { userId, isCompleted: false },
      orderBy: { createdAt: 'desc' }
    })

    // Mapping data tabungan dan menghitung total pengeluaran
    const mapped = await Promise.all(savings.map(async s => {
      const transactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { userId, savingId: s.id, type: 'EXPENSE' }
      })
      return { ...s, currentAmount: transactions._sum.amount || 0 }
    }))

    return mapped
  }

  if (method === 'POST') {
    const { name, targetAmount } = await readBody(event)

    // Menghitung jumlah tabungan yang dimiliki
    const existingCount = await prisma.saving.count({ where: { userId, isCompleted: false } })

    // Validasi apakah pengguna gratis dan memiliki tabungan lebih dari 1
    if (!isPremium && existingCount >= 1) {
      throw createError({ statusCode: 403, message: 'Limit pengguna gratis (1 tabungan) tercapai. Harap upgrade ke Premium.' })
    }

    // Membuat tabungan
    const s = await prisma.saving.create({
      data: {
        userId,
        name,
        targetAmount: Number(targetAmount)
      }
    })
    return s
  }

  // Method DELETE untuk menghapus tabungan
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    const s = await prisma.saving.delete({
      where: { id, userId }
    })
    return s
  }
})
