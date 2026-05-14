<template>
  <div class="space-y-6 pb-20 md:pb-0 animate-fade-in relative z-10 w-full max-w-2xl mx-auto">
    <div class="text-center mb-10 pt-8">
      <div
        class="inline-block bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg mb-6 rotate-2 border border-white/10 hover:rotate-0 transition-transform cursor-default">
        Tingkatkan Levelmu
      </div>
      <h1 class="text-6xl sm:text-7xl font-extrabold text-kelola-teal tracking-tighter drop-shadow-sm mb-4">Finjoy <span
          class="text-kelola-lime drop-shadow-[0_0_10px_rgba(214,251,0,0.5)]">Premium</span>.</h1>
      <p class="text-gray-500 font-semibold tracking-wide">Buka semua fitur canggih dan asisten AI tanpa batas.</p>
    </div>

    <!-- Active Premium State -->
    <div v-if="session?.user?.is_premium"
      class="bg-gradient-to-br from-kelola-teal to-kelola-dark p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/20 text-center animate-fade-in">
      <div
        class="absolute -right-20 -top-20 w-80 h-80 bg-kelola-lime blur-[80px] opacity-20 rounded-full pointer-events-none">
      </div>
      <div class="text-7xl mb-6 drop-shadow-lg">👑</div>
      <h2 class="text-4xl font-extrabold mb-3 tracking-tighter text-white">Sultan Kelola!</h2>
      <p class="text-white/80 font-semibold tracking-wide text-lg">Kamu kini memiliki akses penuh tanpa limit.</p>
    </div>

    <!-- Upgrade Offer -->
    <div v-else
      class="bg-white/80 backdrop-blur-md p-8 sm:p-12 rounded-[3.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.08)] border border-white/20 relative overflow-hidden group">
      <!-- Decor -->
      <div
        class="absolute -right-20 -bottom-20 w-64 h-64 bg-kelola-lime blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity rounded-full pointer-events-none">
      </div>

      <div class="mb-10">
        <h2 class="text-4xl sm:text-5xl font-extrabold text-kelola-teal tracking-tighter mb-4">Akses Sultan</h2>
        <div class="flex items-end gap-2 text-kelola-teal select-none">
          <span class="text-3xl font-bold pb-2">Rp</span>
          <span class="text-7xl font-black tracking-tighter leading-none text-kelola-lime">9</span>
          <span class="text-2xl font-bold pb-1 text-kelola-lime">.900</span>
          <span class="text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest ml-1">/bulan</span>
        </div>
      </div>

      <ul class="space-y-6 mb-12">
        <li class="flex items-center gap-5">
          <div
            class="w-10 h-10 rounded-full bg-kelola-lime flex items-center justify-center text-kelola-teal shadow-inner text-lg font-black shrink-0">
            ✓</div>
          <span class="font-extrabold text-gray-700 text-lg">Auto Scan Struk (AI OCR)</span>
        </li>
        <li class="flex items-center gap-5">
          <div
            class="w-10 h-10 rounded-full bg-kelola-lime flex items-center justify-center text-kelola-teal shadow-inner text-lg font-black shrink-0">
            ✓</div>
          <span class="font-extrabold text-gray-700 text-lg">Buat Anggaran Tanpa Batas</span>
        </li>
        <li class="flex items-center gap-5">
          <div
            class="w-10 h-10 rounded-full bg-kelola-lime flex items-center justify-center text-kelola-teal shadow-inner text-lg font-black shrink-0">
            ✓</div>
          <span class="font-extrabold text-gray-700 text-lg">Laporan PDF/Excel Unlimited</span>
        </li>
      </ul>

      <button @click="payWithMidtrans" :disabled="loading"
        class="w-full bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-6 rounded-3xl font-black text-xl sm:text-2xl uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 border-white/20 relative z-10">
        {{ loading ? 'SABAR DULU...' : 'UPGRADE SEKARANG' }}
      </button>
    </div>

    <Notify v-if="showNotify" :msg="notifyMsg" :show="showNotify" />
  </div>
</template>

<script setup>
const { session, fetchSession } = useCustomAuth()
const { $csrfFetch } = useNuxtApp()

useSeoMeta({ title: 'Premium - Kelola', description: 'Upgrade ke Premium dan nikmati fitur AI tak terbatas di Kelola.' })

const showNotify = ref(false)
const notifyMsg = ref('')
const loading = ref(false)

const payWithMidtrans = async () => {
  loading.value = true
  try {
    const res = await $csrfFetch('/api/payment/token', { method: 'POST' })
    if (res && res.token) {
      window.snap.pay(res.token, {
        onSuccess: async function (result) {
          try { await $csrfFetch('/api/payment/success', { method: 'POST', headers: useRequestHeaders(['cookie']) }) } catch (e) { }
          if (session.value?.user) session.value.user.is_premium = true;
          await fetchSession();
          notifyMsg.value = 'Pembayaran sukses! Selamat menikmati fitur Premium Kelola.'
          showNotify.value = true
          setTimeout(() => useRouter().push('/'), 2000);
        },
        onPending: function (result) {
          notifyMsg.value = 'Pembayaran sedang diproses. Silahkan cek kembali beberapa saat lagi.'
          showNotify.value = true
        },
        onError: function (result) {
          notifyMsg.value = 'Pembayaran gagal. Silahkan coba lagi.'
          showNotify.value = true
        },
        onClose: function () {
          notifyMsg.value = 'Pembayaran ditutup. Silahkan coba lagi.'
          showNotify.value = true
        }
      })
    }
  } catch (e) {
    notifyMsg.value = e.data.message || 'Gagal memanggil Midtrans. Pastikan Server SDK terkonfigurasi dengan benar.'
    showNotify.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      showNotify.value = false
    }, 5000)
  }
}

onMounted(() => {
  if (process.client) {
    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", process.env.MIDTRANS_CLIENT_KEY || 'Mid-client-4iD3maqGpK4A3O3d')
    document.head.appendChild(script)
  }
})
</script>
