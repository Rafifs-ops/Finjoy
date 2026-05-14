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
  const userId = session.user.id
  // @ts-ignore
  const isPremium = session.user.is_premium

  // limit check
  if (!isPremium) {
    const transactions = await prisma.transaction.count({
      where: { userId }
    })
    // jika limit reached (jumlah data transaksi melebihi 10)
    if (transactions >= 10) {
      throw createError({ statusCode: 403, message: 'Limit reached. Upgrade to premium to use this feature without limit' })
    }
  }

  // Mengambil data transaksi
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  })

  // For Excel in some locales (like Indonesia), semicolon is the default delimiter
  let csv = 'Tanggal;Tipe;Kategori;Prioritas;Nominal (Rp);Catatan\n'
  transactions.forEach(t => {
    // Quote descriptions to prevent breaking
    const safeDesc = `"${(t.description || '').replace(/"/g, '""')}"`
    const safeCat = `"${(t.category || '-').replace(/"/g, '""')}"`
    csv += `"${new Date(t.date).toISOString().split('T')[0]}";"${t.type}";${safeCat};"${t.priority || '-'}";${t.amount};${safeDesc}\n`
  })

  setResponseHeader(event, 'Content-Type', 'text/csv')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="Laporan_Keuangan_Kelola_${session.user.name}_${new Date().toISOString().split('T')[0]}.csv"`)

  return csv
})
