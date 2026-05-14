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
  const userId = session.user.id as string // user id
  const method = event.node.req.method

  // GET data transaksi berdasarkan bulan dan tahun
  if (method === 'GET') {
    const query = getQuery(event) // Mengambil data query
    const month = query.month ? parseInt(query.month as string) : null // Mengambil data bulan
    const year = query.year ? parseInt(query.year as string) : null // Mengambil data tahun

    let where: any = { userId } // State where untuk query prisma ORM

    // Jika month dan year ada, maka akan mengambil data tanggal awal dan akhir
    if (month !== null && year !== null) {
      const startDate = new Date(year, month - 1, 1) // Mengambil data tanggal awal 
      const endDate = new Date(year, month, 1) // Mengambil data tanggal akhir
      where.date = {
        gte: startDate,
        lt: endDate
      }
    }

    // Mengambil data transaksi berdasarkan bulan dan tahun
    const transactions = await prisma.transaction.findMany({
      where,
      include: { debt: true, saving: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    })

    return transactions
    // output: list of transactions (array of objects)
    // example output:
    // [
    //   {
    //     id: '1',
    //     userId: '1',
    //     category: 'FOOD',
    //     amount: 10000,
    //     type: 'EXPENSE',
    //     date: '2022-01-01',
    //     description: 'Food',
    //     priority: 'HIGH',
    //     debtId: null,
    //     savingId: null,
    //     receiptUrl: null,
    //     updatedAt: '2022-01-01'
    //   }
    // ]
  }

  // POST data transaksi
  if (method === 'POST') {
    // Mengambil data body dari request
    const body = await readBody(event)

    // Jika transaksi berupa bayar hutang
    if (body.type === 'EXPENSE' && body.debtId) {
      const debt = await prisma.debt.findUnique({ where: { id: body.debtId } }) // Mencari data hutang berdasarkan id utang
      if (!debt) throw createError({ statusCode: 404, message: 'Debt not found' })

      // Jika jumlah bayar lebih besar dari jumlah sisa hutang
      if (debt.remaining_amount < body.amount) {
        throw createError({ statusCode: 400, message: 'Payment exceeds remaining debt' })
      }

      // Mengupdate data sisa hutang
      await prisma.debt.update({
        where: { id: debt.id },
        data: {
          remaining_amount: debt.remaining_amount - body.amount,
          status: debt.remaining_amount - body.amount === 0 ? 'PAID' : 'UNPAID' // Jika sisa hutang 0 maka statusnya berubah menjadi PAID
        }
      })
    }

    // Jika transaksi berupa pengeluaran
    if (body.type === 'EXPENSE' && body.category) {
      const monthYear = new Date(body.date).toISOString().substring(0, 7) // Mengambil data bulan dan tahun

      // Mencari data budget berdasarkan user id, category, dan bulan tahun
      const budget = await prisma.budget.findFirst({
        where: { userId, category: body.category, monthYear }
      })

      // Jika data budget ada
      if (budget) {
        const minDate = new Date(`${monthYear}-01T00:00:00.000Z`) // Mengambil data tanggal awal bulan
        const nextMonth = new Date(minDate) // Mengambil data tanggal akhir bulan
        nextMonth.setMonth(nextMonth.getMonth() + 1) // Menambah 1 bulan dari tanggal awal bulan

        // Mengambil data transaksi berdasarkan user id, category, dan bulan tahun
        const currentSum = await prisma.transaction.aggregate({
          where: { userId, category: body.category, type: 'EXPENSE', date: { gte: minDate, lt: nextMonth } },
          _sum: { amount: true }
        })
        const used = currentSum._sum.amount || 0 // Mengambil data jumlah transaksi

        // Jika jumlah transaksi lebih besar dari batas budget
        if (used + Number(body.amount) > budget.monthlyLimit) {
          throw createError({
            statusCode: 400,
            statusMessage: `Limit anggaran kategori ini sisa Rp ${budget.monthlyLimit - used}. Transaksi ditolak.`
          })
        }
      }
    }

    // Jika transaksi berupa pemasukan atau pengeluaran, maka akan menambahkan data ke database
    const tx = await prisma.transaction.create({
      data: {
        id: randomUUID(),
        userId,
        category: body.category,
        amount: Number(body.amount),
        type: body.type,
        date: new Date(body.date),
        description: body.description,
        priority: body.priority,
        debtId: body.debtId || null,
        savingId: body.savingId || null,
        receiptUrl: body.receiptUrl || null,
        updatedAt: new Date()
      }
    })

    // Jika pengeluaran untuk nabung
    if (body.type === 'EXPENSE' && body.savingId) {
      const saving = await prisma.saving.findUnique({
        where: { id: body.savingId }
      })

      if (saving) {
        const sumResult = await prisma.transaction.aggregate({
          where: { userId, savingId: body.savingId, type: 'EXPENSE' },
          _sum: { amount: true }
        })
        const totalSaved = sumResult._sum.amount || 0

        if (totalSaved >= saving.targetAmount) {
          // Tandai sebagai selesai
          await prisma.saving.update({
            where: { id: saving.id },
            data: {
              isCompleted: true,
              completedAt: new Date()
            }
          })

          return {
            tx,
            savingFulfilled: true,
            message: `Selamat, tabungan ${saving.name} Anda sudah terpenuhi`
          }
        }
      }
    }

    return tx
  }
})
