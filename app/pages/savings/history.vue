<template>
  <div class="pb-20 md:pb-0 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/savings"
        class="w-10 h-10 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-500 hover:text-kelola-teal hover:scale-110 transition shadow-sm border border-white/20">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Riwayat Tabungan</h1>
        <p class="mt-1 font-semibold text-sm">Tabungan yang berhasil kamu capai.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-20 flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-kelola-lime border-t-kelola-teal rounded-full animate-spin shadow-lg"></div>
      <p class="mt-4 font-black text-kelola-teal">Memuat riwayat...</p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="history?.length === 0"
        class="text-center py-16 px-10 md:px-0 bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20 border-dashed">
        <div class="text-5xl mb-4 drop-shadow-sm">🏆</div>
        <p class="text-gray-600 font-bold mb-3">Belum ada tabungan yang berhasil dipenuhi.</p>
        <NuxtLink to="/savings"
          class="font-black text-sm uppercase tracking-wider hover:underline hover:text-kelola-teal transition">Kembali
          ke Tabungan Aktif</NuxtLink>
      </div>

      <div v-for="h in history" :key="h.id"
        class="bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-md p-7 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-green-100 hover:shadow-md transition group">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-green-200 text-green-700 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
            🎉
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-gray-800 text-lg uppercase tracking-wide">{{ h.name }}</h3>
              <p class="text-xs font-bold text-gray-400">{{ new Date(h.completedAt).toLocaleDateString('id-ID', {
                day:
                  'numeric', month: 'long', year: 'numeric'
              }) }}</p>
            </div>
            <p class="font-extrabold text-sm sm:text-base tracking-tight text-kelola-teal mt-1">
              Rp {{ formatNumber(h.targetAmount) }} Terkumpul
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { csrf } = useCsrf()
useSeoMeta({ title: 'Riwayat Tabungan - Kelola' })

const { data: history, pending } = useCsrfFetch('/api/savings/history')

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)
</script>
