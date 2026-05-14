<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-bl from-kelola-dark via-kelola-teal to-kelola-dark px-4 relative overflow-hidden py-10">
    <div
      class="absolute top-20 right-20 w-80 h-80 bg-kelola-lime rounded-full blur-[80px] opacity-30 pointer-events-none">
    </div>
    <div
      class="absolute bottom-0 left-0 w-96 h-96 bg-kelola-pale rounded-full blur-[100px] opacity-20 pointer-events-none">
    </div>

    <div
      class="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-white/20">
      <div class="text-center mb-8 flex flex-col items-center">
        <img src="/assets/images/logo-finjoy.png" alt="Finjoy Logo" class="h-12 w-auto mb-4 drop-shadow-md" />
        <h1 class="text-4xl font-extrabold text-kelola-lime tracking-tighter mb-1 drop-shadow-sm">{{ isOtpMode ?
          'Verifikasi Email.' : 'Daftar Akun.' }}</h1>
        <p class="text-kelola-lime font-semibold tracking-wide text-sm uppercase">
          {{ isOtpMode ? 'Masukkan kode OTP yang kami kirim' : 'Mulai kelola uangmu sekarang' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="errorMsg"
          class="bg-red-100 text-red-500 font-bold p-3 rounded-2xl text-xs text-center border border-red-200 shadow-inner">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg"
          class="bg-green-100 text-green-600 font-bold p-3 rounded-2xl text-xs text-center border border-green-200 shadow-inner">
          {{ successMsg }}
        </div>

        <template v-if="!isOtpMode">
          <div>
            <input v-model="form.name" type="text" required placeholder="Bambang"
              class="w-full bg-white/80 border-2 border-transparent rounded-2xl py-3 px-5 text-kelola-teal font-bold focus:outline-none focus:border-kelola-lime focus:ring-4 focus:ring-kelola-lime/20 transition-all shadow-inner placeholder:font-medium placeholder:text-gray-300" />
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-2">Alamat
              Email</label>
            <input v-model="form.email" type="email" required placeholder="email@contoh.com"
              class="w-full bg-white/80 border-2 border-transparent rounded-2xl py-3 px-5 text-kelola-teal font-bold focus:outline-none focus:border-kelola-lime focus:ring-4 focus:ring-kelola-lime/20 transition-all shadow-inner placeholder:font-medium placeholder:text-gray-300" />
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2">Kata Sandi
              Baru</label>
            <input v-model="form.password" type="password" required placeholder="••••••••"
              class="w-full bg-white/80 border-2 border-transparent rounded-2xl py-3 px-5 text-kelola-teal font-extrabold focus:outline-none focus:border-kelola-lime focus:ring-4 focus:ring-kelola-lime/20 transition-all shadow-inner placeholder:font-bold placeholder:text-gray-400" />
          </div>
        </template>

        <template v-else>
          <div>
            <label
              class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-2 text-center">Kode
              OTP</label>
            <input v-model="otpCode" type="text" required placeholder="123456" maxlength="6"
              class="w-full bg-white/80 border-2 border-transparent rounded-2xl py-4 px-5 text-kelola-teal font-black text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-kelola-lime focus:ring-4 focus:ring-kelola-lime/20 transition-all shadow-inner placeholder:font-bold placeholder:text-gray-300 placeholder:tracking-normal" />
          </div>
        </template>

        <button type="submit" :disabled="loading"
          class="w-full mt-8 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-4 rounded-2xl font-black md:text-lg text-md uppercase tracking-widest shadow-[0_10px_30px_rgba(214,251,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 border-b-4 border-white/20">
          <span v-if="loading">SABAR DULU...</span>
          <span v-else-if="!isOtpMode">DAFTAR SEKARANG</span>
          <span v-else>VERIFIKASI OTP</span>
        </button>
      </form>

      <p v-if="!isOtpMode" class="mt-6 text-center text-xs text-kelola-lime font-bold uppercase tracking-wide">
        Sudah punya akun?
        <NuxtLink to="/login"
          class="text-kelola-teal bg-kelola-lime px-4 py-2 rounded-xl ml-1 hover:brightness-110 transition-all shadow-md inline-block">
          Masuk
        </NuxtLink>
      </p>
      <p v-else
        class="mt-6 text-center text-xs text-kelola-lime font-bold uppercase tracking-wide cursor-pointer hover:underline"
        @click="isOtpMode = false">
        Batal & Kembali
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
useSeoMeta({ title: 'Daftar - Kelola' })

const { $csrfFetch } = useNuxtApp()
const form = ref({ name: '', email: '', password: '' })
const otpCode = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const isOtpMode = ref(false)

const handleSubmit = async () => {
  if (isOtpMode.value) {
    await handleVerify()
  } else {
    await handleRegister()
  }
}

const handleRegister = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|id|org)$/
  if (!emailRegex.test(form.value.email)) {
    errorMsg.value = 'Format email tidak valid (contoh: nama@email.com)'
    loading.value = false
    return
  }

  try {
    const res = await $csrfFetch('/api/send-otp', {
      method: 'POST',
      body: form.value
    })
    successMsg.value = res.message || 'OTP berhasil dikirim ke email Anda.'
    isOtpMode.value = true
  } catch (e) {
    errorMsg.value = e.data?.message || 'Pendaftaran gagal.'
  } finally {
    loading.value = false
  }
}

const handleVerify = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $csrfFetch('/api/verify-otp', {
      method: 'POST',
      body: {
        email: form.value.email,
        otp: otpCode.value
      }
    })
    window.location.href = '/'
  } catch (e) {
    errorMsg.value = e.data?.message || 'Verifikasi gagal.'
  } finally {
    loading.value = false
  }
}
</script>
