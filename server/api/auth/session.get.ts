import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event) // Mengambil data auth
    return session // Mengembalikan data auth
  } catch (e) {
    return null // Mengembalikan null jika tidak ada data auth
  }
})
