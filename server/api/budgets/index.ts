import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'
import { randomUUID } from 'node:crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event) // Mengambil data session auth

  // Jika session tidak ada
  if (!session || !session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  // @ts-ignore
  const userId = session.user.id as string
  // @ts-ignore
  const isPremium = session.user.is_premium

  const method = event.node.req.method // Mengambil jenis method http request

  // Jika method GET
  if (method === 'GET') {
    // Mengambil bulan saat ini dalam format YYYY-MM
    const currentMonth = new Date().toISOString().substring(0, 7)

    // Mengambil data budget
    const budgets = await prisma.budget.findMany({
      where: { userId, monthYear: currentMonth }
    })

    // Menghitung total pengeluaran untuk setiap budget
    const mapped = await Promise.all(budgets.map(async b => {
      // Menentukan awal dan akhir bulan
      const start = new Date(`${currentMonth}-01T00:00:00.000Z`)
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1))

      // Menghitung total pengeluaran
      const spent = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          category: b.category,
          type: 'EXPENSE',
          date: { gte: start, lt: end }
        }
      })
      return { ...b, spent: spent._sum.amount || 0 }
    }))
    return mapped
  }

  // Jika method POST
  if (method === 'POST') {
    // Mengambil data category dan monthlyLimit dari body request
    const { category, monthlyLimit } = await readBody(event)

    // Mengambil bulan saat ini dalam format YYYY-MM
    const currentMonth = new Date().toISOString().substring(0, 7)

    // Menghitung jumlah budget yang sudah dibuat
    const existingCount = await prisma.budget.count({ where: { userId, monthYear: currentMonth } })

    // Mencari budget dengan kategori yang sama pada bulan ini
    const existingThisCat = await prisma.budget.findFirst({
      where: { userId, category, monthYear: currentMonth }
    })

    // Jika pengguna gratis dan sudah membuat 3 budget
    if (!isPremium && existingCount >= 3 && !existingThisCat) {
      throw createError({ statusCode: 403, message: 'Limit pengguna gratis (3 anggaran) tercapai. Harap upgrade ke Premium.' })
    }

    // Membuat atau mengupdate budget
    const b = await prisma.budget.upsert({
      where: {
        userId_category_monthYear: { userId, category, monthYear: currentMonth }
      },
      update: {
        monthlyLimit: Number(monthlyLimit),
        updatedAt: new Date()
      },
      create: {
        id: randomUUID(),
        userId,
        category,
        monthYear: currentMonth,
        monthlyLimit: Number(monthlyLimit),
        updatedAt: new Date()
      }
    })
    return b
  }

  // Jika method DELETE
  if (method === 'DELETE') {
    // Mengambil data id dari body request
    const { id } = await readBody(event)

    // Menghapus budget
    const b = await prisma.budget.delete({
      where: { id, userId }
    })
    return b
  }
})
