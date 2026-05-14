import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event) // Mendapatkan data dari request


  if (!email || !password) { // Validasi email dan password
    throw createError({ statusCode: 400, message: 'Email and password required' })
  }

  // Validasi format email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|id|org)$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, message: 'Format email tidak valid' })
  }

  // Mencari user berdasarkan email
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.password) { // Validasi user
    throw createError({ statusCode: 400, message: 'Kredensial tidak valid atau akun login via Google sebelumnya.' })
  }

  const isValid = await bcrypt.compare(password, user.password) // Validasi password

  if (!isValid) { // Validasi password
    throw createError({ statusCode: 400, message: 'Password salah.' })
  }

  // Validasi verifikasi email untuk user yang sudah terlanjur register
  if (!user.email_verified_at) {
    throw createError({ statusCode: 403, message: 'Email belum diverifikasi! Silakan daftar ulang atau cek email Anda untuk OTP.' })
  }

  // Membuat token JWT
  const token = jwt.sign({ id: user.id }, process.env.AUTH_SECRET as string, { expiresIn: '7d' })

  // Set cookie untuk simpan token
  setCookie(event, 'auth_token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' })

  return { success: true, user: { name: user.name, email: user.email } } // Mengirim response
})
