import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Mengambil data dari body Request
  const body = await readBody(event)

  // Midtrans Signature Validation
  const receivedSignature = body.signature_key
  const expectedSignature = crypto.createHash('sha512').update(`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex')

  // Jika signature key tidak sesuai, maka akan throw error
  if (receivedSignature !== expectedSignature) {
    throw createError({ statusCode: 403, message: 'Invalid signature key' })
  }

  if (body.transaction_status === 'settlement' || body.transaction_status === 'capture') {
    // Assuming order_id contains userId like `PREMIUM-{userId}-{timestamp}`
    const userId = body.order_id.split('-')[1]

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          is_premium: true,
          premium_expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1 month premium
        }
      })
    }
  }

  return { status: 'ok' }
})
