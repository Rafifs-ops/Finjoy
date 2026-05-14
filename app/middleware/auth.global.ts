export default defineNuxtRouteMiddleware(async (to, from) => {
    const { session, fetchSession } = useCustomAuth() // Mengambil data auth di client
    if (!session.value) {
        await fetchSession() // Mengambil data auth di server
    }
    const publicPages = ['/login', '/register', '/forgot-password'] // Halaman yang tidak memerlukan auth
    const isPublicRoute = publicPages.includes(to.path) // Cek apakah halaman yang diakses adalah halaman publik

    if (!isPublicRoute && !session.value) { // Jika user belum login dan bukan di halaman login/register
        return navigateTo('/login') // Arahkan ke halaman login
    } else if (isPublicRoute && session.value) { // Jika user sudah login dan berada di halaman login/register
        return navigateTo('/') // Arahkan ke dashboard
    }
})