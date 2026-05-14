export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token', { path: '/' }) // Menghapus cookie
  return { success: true }
})
