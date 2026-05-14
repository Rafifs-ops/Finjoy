<template>
  <div class="pb-20 md:pb-0 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Tabungan</h1>
        <p class="mt-1 font-semibold text-sm">Kelola target tabungan masa depanmu.</p>
      </div>
      <div class="flex md:flex-row flex-col gap-3">
        <NuxtLink to="/savings/history"
          class="bg-white/50 backdrop-blur-md text-kelola-teal px-5 py-3 rounded-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border-2 border-white/20 hover:border-kelola-lime">
          Riwayat
        </NuxtLink>
        <button @click="showAddModal = true"
          class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-6 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(214,251,0,0.3)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent">
          + Buat
        </button>
      </div>
    </div>

    <!-- Limit Info -->
    <div v-if="!session?.user?.is_premium"
      class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-3xl flex items-center justify-between shadow-sm mb-5">
      <div class="text-sm font-bold text-blue-900 pr-4 leading-tight">
        Akun Gratis: Maksimal 1 Tabungan Aktif.
      </div>
      <NuxtLink to="/premium"
        class="text-xs font-black bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg hover:scale-105 transition uppercase tracking-wider">
        Upgrade</NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-20 flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-kelola-lime border-t-kelola-teal rounded-full animate-spin shadow-lg"></div>
      <p class="mt-4 font-black text-kelola-teal">Memuat tabunganmu...</p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="savings?.length === 0"
        class="text-center py-16 bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20 border-dashed">
        <div class="text-5xl mb-4 drop-shadow-sm">🐖</div>
        <p class="text-gray-600 font-bold mb-3">Belum ada target tabungan aktif.</p>
        <button @click="showAddModal = true"
          class="font-black text-sm uppercase tracking-wider hover:underline hover:text-kelola-teal transition">Mulai
          Menabung</button>
      </div>

      <div v-for="s in savings" :key="s.id"
        class="bg-white/80 backdrop-blur-md p-7 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20 hover:shadow-md transition group">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 bg-kelola-beige rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
              💰
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-gray-800 text-lg uppercase tracking-wide">{{ s.name }}</h3>
                <button @click="deleteSaving(s.id)" class="text-red-300 hover:text-red-500 transition-colors p-1"
                  title="Hapus Tabungan">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                  </svg>
                </button>
              </div>
              <p class="text-xs font-bold text-gray-600">Target: Rp {{ formatNumber(s.targetAmount) }}</p>
            </div>
          </div>
          <div class="sm:text-right bg-kelola-teal/5 p-2 sm:p-0 sm:bg-transparent rounded-xl">
            <p class="font-extrabold text-sm sm:text-base tracking-tight text-green-500">
              Terkumpul: Rp {{ formatNumber(s.currentAmount) }}
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div
          class="h-5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200/50 relative">
          <div class="h-full rounded-full transition-all duration-1000 flex items-center justify-end px-2"
            :class="getProgressBarColor(s.currentAmount, s.targetAmount)"
            :style="{ width: Math.min((s.currentAmount / s.targetAmount) * 100, 100) + '%' }">
            <span v-if="(s.currentAmount / s.targetAmount) > 0.1"
              class="text-[8px] font-black text-white/80 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">{{
                Math.round((s.currentAmount / s.targetAmount) * 100) }}%</span>
          </div>
        </div>
        <div class="flex justify-between items-center mt-2">
          <p class="text-[10px] font-bold text-gray-400">0%</p>
          <p class="text-[10px] font-black text-kelola-teal uppercase tracking-widest">
            {{ Math.round((s.currentAmount / s.targetAmount) * 100) }}% Terkumpul
          </p>
          <p class="text-[10px] font-bold text-gray-400">100%</p>
        </div>
      </div>
    </div>

    <!-- Modal Buat Tabungan -->
    <div v-if="showAddModal"
      class="fixed inset-0 bg-kelola-dark/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        class="bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative border border-white/20">
        <button @click="showAddModal = false"
          class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 class="text-3xl font-extrabold text-kelola-teal mb-8 tracking-tighter">Buat Tabungan</h2>

        <form @submit.prevent="saveSaving" class="space-y-5">
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Nama Tabungan</label>
            <input v-model="form.name" type="text" required placeholder="Contoh: Beli Laptop Baru"
              class="w-full bg-white/50 rounded-2xl py-5 px-5 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-kelola-lime/30 border-2 border-transparent focus:border-kelola-lime transition-all shadow-inner" />
          </div>
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Target Uang</label>
            <div class="relative">
              <span
                class="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-kelola-teal select-none">Rp</span>
              <input v-model="form.targetAmount" type="number" required placeholder="0"
                class="w-full bg-white/50 rounded-2xl py-5 pl-14 pr-5 font-black text-kelola-teal text-3xl focus:outline-none focus:ring-4 focus:ring-kelola-lime/30 border-2 border-transparent focus:border-kelola-lime shadow-inner transition-all" />
            </div>
          </div>
          <button type="submit" :disabled="isSaving"
            class="w-full mt-6 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex justify-center shadow-[0_10px_30px_rgba(214,251,0,0.3)] disabled:opacity-50 border-b-4 border-white/20">
            {{ isSaving ? 'MENYIMPAN...' : 'SIMPAN TABUNGAN' }}
          </button>
        </form>
      </div>
    </div>

    <Notify v-if="showNotify" :msg="notifyMsg" :show="showNotify" />
  </div>
</template>

<script setup>
const { session } = useCustomAuth()
const { $csrfFetch } = useNuxtApp()
useSeoMeta({ title: 'Tabungan - Kelola' })

const { data: savings, pending, refresh } = useCsrfFetch('/api/savings')

const showAddModal = ref(false)
const isSaving = ref(false)
const form = ref({ name: '', targetAmount: '' })
const showNotify = ref(false)
const notifyMsg = ref('')

const saveSaving = async () => {
  if (!form.value.name || !form.value.targetAmount) return
  isSaving.value = true
  try {
    await $csrfFetch('/api/savings', {
      method: 'POST',
      body: {
        name: form.value.name,
        targetAmount: Number(form.value.targetAmount)
      }
    })
    showAddModal.value = false
    form.value = { name: '', targetAmount: '' }
    notifyMsg.value = 'Tabungan berhasil ditambahkan'
    showNotify.value = true
    await refresh()
  } catch (e) {
    notifyMsg.value = e.data.message || 'Gagal menyimpan tabungan'
    showNotify.value = true
  } finally {
    isSaving.value = false
    setTimeout(() => {
      showNotify.value = false
    }, 2000)
  }
}

const deleteSaving = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus tabungan ini?')) return
  try {
    await $csrfFetch('/api/savings', {
      method: 'DELETE',
      body: { id }
    })
    notifyMsg.value = 'Tabungan berhasil dihapus'
    showNotify.value = true
    setTimeout(() => {
      refresh()
    }, 2000)
  } catch (e) {
    notifyMsg.value = e.data.message || 'Gagal menghapus tabungan'
    showNotify.value = true
  }
}

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)

const getProgressBarColor = (current, target) => {
  const percent = current / target
  if (percent >= 1) return 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
  if (percent > 0.5) return 'bg-green-500 shadow-[0_0_10px_rgba(214,251,0,0.3)]'
  return 'bg-green-500 shadow-[0_0_10px_rgba(147,197,253,0.3)]'
}
</script>
