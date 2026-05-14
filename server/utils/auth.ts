import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const requireAuth = async (event: any) => {
  const token = getCookie(event, 'auth_token') // Mengambil data token dari cookie

  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' }) // Validasi token



  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET as string) as any // Decode token
    const user = await prisma.user.findUnique({ where: { id: decoded.id } }) // Mencari user berdasarkan id
    if (!user) throw new Error('User not found') // Validasi user

    const dateNow = new Date()
    if (user.is_premium && user.premium_expiry && user.premium_expiry < dateNow) {
      await prisma.user.update({ where: { id: user.id }, data: { is_premium: false, premium_expiry: null } })
      user.is_premium = false
    }

    return { // Mengembalikan data user
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        is_premium: user.is_premium
      }
    }
  } catch (e) {
    throw createError({ statusCode: 401, message: 'Invalid session' })
  }
}
