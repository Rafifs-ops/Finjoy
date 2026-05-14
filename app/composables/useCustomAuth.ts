export const useCustomAuth = () => {
  const session = useState<any>('auth_session', () => null) // Membuat variable session
  const { $csrfFetch } = useNuxtApp()

  // Mengambil data auth di server
  const fetchSession = async () => {
    try {
      const data = await $csrfFetch('/api/auth/session', { headers: useRequestHeaders(['cookie']) })
      session.value = data // Menyimpan data auth di variable session client
    } catch (e) {
      session.value = null // Mengembalikan null jika tidak ada data auth
    }
  }

  // Fungsi logout
  const signOut = async () => {
    await $csrfFetch('/api/auth/logout', { method: 'POST' })
    session.value = null
    window.location.href = '/login' // Mengarahkan ke halaman login
  }

  return { session, fetchSession, signOut }
}
