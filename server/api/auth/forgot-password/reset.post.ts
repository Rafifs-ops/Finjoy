import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email, otp, newPassword } = await readBody(event) // Mengambil data dari body request

  if (!email || !otp || !newPassword) { // Validasi apakah data email, otp, dan newPassword diisi
    throw createError({ statusCode: 400, message: 'Email, OTP, dan Kata Sandi Baru harus diisi' })
  }

  const user = await prisma.user.findUnique({ where: { email } }) // Mencari data user di db berdasarkan email

  // Jika user tidak ditemukan
  if (!user) {
    throw createError({ statusCode: 404, message: 'Email tidak terdaftar' })
  }

  // Validate OTP
  if (user.reset_password_otp !== otp) {
    throw createError({ statusCode: 400, message: 'Kode OTP tidak valid' })
  }

  // Check Expiration
  if (!user.reset_password_otp_expires_at || new Date() > user.reset_password_otp_expires_at) {
    throw createError({ statusCode: 400, message: 'Kode OTP telah kedaluwarsa' })
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Update user
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      reset_password_otp: null,
      reset_password_otp_expires_at: null,
    }
  })

  return { success: true, message: 'Kata sandi berhasil diubah. Silakan login kembali.' }
})
