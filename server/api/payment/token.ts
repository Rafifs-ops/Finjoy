import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Mengambil data session
  const session = await requireAuth(event)

  // Validasi session
  if (!session || !session.user) throw createError({ statusCode: 401, message: 'Unauthorized' })


  // @ts-ignore
  const userId = session.user.id // Mengambil user id dari session
  const shortId = userId.substring(0, 8) // Membuat short id dan order id
  const orderId = `PRM-${shortId}-${Date.now()}` // Membuat order id

  // Base64 encode Midtrans Server Key
  const authString = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64')

  // Melakukan request token ke Midtrans API
  try {
    const response = await $fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: {
        transaction_details: {
          order_id: orderId,
          gross_amount: 9900
        },
        customer_details: {
          first_name: session.user.name,
          email: session.user.email
        }
      }
    })
    return response // Contains token
  } catch (error: any) {
    console.error('Midtrans API Error:', error.data || error.message)
    throw createError({ statusCode: 500, message: 'Failed to create payment token' })
  }
})
