import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../utils/auth'
import { randomUUID } from 'node:crypto'

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

  // Mengetahui Method HTTP yang digunakan
  const method = event.node.req.method

  // Jika menggunakan method GET
  if (method === 'GET') {
    // Mengambil data hutang berdasarkan user id
    return await prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Jika menggunakan method POST
  if (method === 'POST') {
    // Mengambil data title, total_amount, dan dueDate dari body request
    const { title, total_amount, dueDate } = await readBody(event)

    // Membuat data hutang
    return await prisma.debt.create({
      data: {
        id: randomUUID(),
        userId,
        title,
        total_amount: Number(total_amount),
        remaining_amount: Number(total_amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'UNPAID',
        updatedAt: new Date()
      }
    })
  }

  // Menghapus data hutang
  if (method === 'DELETE') {
    // Mengambil data id dari body request
    const { id } = await readBody(event)

    // Mengambil data hutang berdasarkan id
    const debt = await prisma.debt.findUnique({ where: { id } })

    // Validasi data hutang
    if (!debt || debt.userId !== userId) {
      throw createError({ statusCode: 404, message: 'Hutang tidak ditemukan' })
    }

    // Delete transactions associated with this debt
    await prisma.transaction.deleteMany({
      where: { debtId: id, userId }
    })

    return await prisma.debt.delete({
      where: { id }
    })
  }
})
