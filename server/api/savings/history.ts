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

  const method = event.node.req.method // Mengetahui method GET/POST

  // Jika method GET, mengambil data
  if (method === 'GET') {
    const history = await prisma.saving.findMany({
      where: { userId, isCompleted: true },
      orderBy: { completedAt: 'desc' }
    })

    return history
  }
})
