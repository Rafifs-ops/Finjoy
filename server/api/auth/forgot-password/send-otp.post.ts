import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event) // Mengambil email dari body request

  // Validasi apakah input email diisi
  if (!email) {
    throw createError({ statusCode: 400, message: 'Harap masukkan alamat email' })
  }

  // Validasi format email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|id|org)$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, message: 'Format email tidak valid' })
  }

  // Mencari data user di db berdasarkan email
  const user = await prisma.user.findUnique({ where: { email } })

  // Jika user tidak ditemukan
  if (!user) {
    throw createError({ statusCode: 404, message: 'Email tidak terdaftar di sistem kami' })
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Update reset password OTP for user
  await prisma.user.update({
    where: { email },
    data: {
      reset_password_otp: otp,
      reset_password_otp_expires_at: expiresAt,
    }
  })

  // Send Email using Nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  try {
    await transporter.sendMail({
      from: `"Finjoy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Kode Verifikasi Lupa Kata Sandi',
      text: `Halo ${user.name || 'Pengguna'},\n\nKode verifikasi Anda untuk mengatur ulang kata sandi adalah: ${otp}\n\nKode ini berlaku selama 5 menit.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Reset Kata Sandi Akun Finjoy</h2>
          <p>Halo <strong>${user.name || 'Pengguna'}</strong>,</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Berikut adalah kode OTP Anda:</p>
          <h1 style="color: #2F9E44; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>Kode di atas akan kedaluwarsa dalam 5 menit. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw createError({ statusCode: 500, message: 'Gagal mengirim email OTP' })
  }

  return { success: true, message: 'OTP untuk reset password telah dikirim ke email Anda' }
})
