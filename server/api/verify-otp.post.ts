import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Mengambil data dari body request
  const { email, otp } = await readBody(event)

  // Validasi data
  if (!email || !otp) {
    throw createError({ statusCode: 400, message: 'Harap isi email dan kode OTP' })
  }

  // Cek apakah user sudah terdaftar
  const user = await prisma.user.findUnique({ where: { email } })

  // Jika user tidak ditemukan
  if (!user) {
    throw createError({ statusCode: 404, message: 'Email tidak ditemukan' })
  }

  // Jika user sudah terverifikasi
  if (user.email_verified_at) {
    throw createError({ statusCode: 400, message: 'Email sudah diverifikasi sebelumnya' })
  }

  // Jika kode OTP tidak valid
  if (user.otp_code !== otp) {
    throw createError({ statusCode: 400, message: 'Kode OTP tidak valid' })
  }

  const now = new Date()
  // Jika kode OTP sudah kedaluwarsa
  if (!user.otp_expires_at || user.otp_expires_at < now) {
    throw createError({ statusCode: 400, message: 'Kode OTP sudah kedaluwarsa, silakan daftar ulang.' })
  }

  // Update set email_verified_at and remove OTP
  await prisma.user.update({
    where: { email },
    data: {
      email_verified_at: now,
      otp_code: null,
      otp_expires_at: null
    }
  })

  // Login successful

  // Membuat token dan simpan ke cookie
  const token = jwt.sign({ id: user.id }, process.env.AUTH_SECRET as string, { expiresIn: '7d' })
  setCookie(event, 'auth_token', token, { maxAge: 60 * 60 * 24 * 7, path: '/' })

  return { success: true, user: { name: user.name, email: user.email } }
})
