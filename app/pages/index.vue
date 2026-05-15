<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Insight -->
    <header
      class="bg-gradient-to-br from-kelola-teal to-kelola-dark text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-white/10 relative overflow-hidden group">
      <!-- Decorative -->
      <div
        class="absolute -right-20 -top-20 w-64 h-64 bg-kelola-lime blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity rounded-full pointer-events-none">
      </div>
      <div
        class="absolute -left-10 -bottom-10 w-40 h-40 bg-kelola-pale blur-[60px] opacity-40 rounded-full pointer-events-none">
      </div>

      <div class="flex items-start justify-between relative z-10">
        <div>
          <h1 class="text-3xl font-extrabold mb-1 tracking-tight text-white drop-shadow-sm">Halo, {{
            session?.user?.name?.split(' ')[0] || 'Bro' }}! 👋</h1>
        </div>
        <div v-if="session?.user?.is_premium"
          class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(214,251,0,0.5)]">
          Premium
        </div>
        <NuxtLink v-else to="/premium"
          class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-center text-kelola-teal text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(214,251,0,0.5)]">
          Upgrade Premium
        </NuxtLink>
      </div>
      <div class="mt-4 flex justify-end">
        <NuxtLink to="/ai"
          class="bg-white/20 hover:bg-white/30 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors inline-block text-center border border-white/20 backdrop-blur-md">
          Ngobrol sama AI &rarr;
        </NuxtLink>
      </div>

      <!-- AI Insight Card -->
      <div
        class="mt-8 bg-white/10 p-5 rounded-3xl backdrop-blur-xl border border-white/10 flex gap-4 items-start shadow-inner relative z-10">
        <div class="bg-gradient-to-br from-kelola-lime to-kelola-pale text-kelola-teal p-3 rounded-2xl shadow-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z">
            </path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-kelola-lime font-extrabold text-sm mb-1 uppercase tracking-wider">AI Daily Insight ✨
          </h3>

          <!-- Tombol Generate Insight -->
          <div v-if="!hasRequestedInsight && !insight" class="py-2">
            <button @click="getAIInsight"
              class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(214,251,0,0.4)] active:scale-95">
              💡 Beri Saya Insight
            </button>
          </div>

          <!-- Konten Insight (Loading atau Hasil) -->
          <div v-else>
            <p v-if="insightPending" class="text-sm text-white/90 animate-pulse font-bold">Meracik insight personal
              untukmu...</p>
            <div v-else class="animate-fade-in-insight">
              <p class="text-sm text-white/90 leading-relaxed font-medium">{{
                insight?.insight || 'Yuk, catat transaksi pertamamu agar AI bisa memberi masukan!' }}</p>
              <NuxtLink v-if="insight?.isLimitReached" to="/premium"
                class="inline-block mt-3 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_15px_rgba(214,251,0,0.4)]">
                🚀 Upgrade Premium
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Balances -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100/50 flex flex-col justify-around hover:shadow-md transition">
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-2xl bg-kelola-sea/10 flex items-center justify-center text-kelola-sea">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          </div>
          <span class="font-bold text-gray-600 uppercase tracking-wider text-xs">Saldo Cash (IDR)</span>
        </div>
        <h2 class="md:text-5xl text-3xl font-extrabold text-kelola-teal tracking-tighter">Rp {{
          formatNumber(dashboard?.fiatBalance
            || 0) }}</h2>
      </div>

      <!-- Assets (Stocks/Crypto) -->
      <NuxtLink to="/portfolios"
        class="bg-gradient-to-br from-kelola-lime to-kelola-pale p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition group block">
        <div class="flex items-center gap-3 mb-6 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-kelola-teal/10 flex items-center justify-center text-kelola-teal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6">
              </path>
            </svg>
          </div>
          <span
            class="font-bold text-kelola-teal uppercase tracking-wider text-xs underline underline-offset-4 decoration-kelola-teal/20">Aset
            Investasi</span>
        </div>
        <h2
          class="md:text-5xl text-3xl font-extrabold text-kelola-teal tracking-tighter relative z-10 group-hover:scale-[1.02] transition-transform origin-left">
          Rp {{ formatNumber(totalAssetValue) }}
        </h2>
        <p
          class="text-xs text-kelola-teal/60 font-bold mt-3 relative z-10 tracking-wide uppercase group-hover:underline">
          Cek Portofolio 👉</p>
      </NuxtLink>
    </section>

    <!-- Overview Chart -->
    <section class="mt-2" v-if="dashboard?.recentTransactions?.length > 0 && hasExpenses">
      <div
        class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition">
        <div class="flex-1 w-full relative">
          <h3 class="text-xl font-extrabold text-kelola-teal tracking-tight mb-4 text-center md:text-left">Distribusi
            Pengeluaran <span class="text-md font-black opacity-80">Bulan Ini</span></h3>
          <div class="h-44 w-full relative">
            <ClientOnly>
              <Doughnut :data="chartData" :options="chartOptions" />
            </ClientOnly>
          </div>
        </div>
        <!-- Minimap text -->
        <div class="flex-1 w-full space-y-4">
          <div v-for="(val, idx) in chartDataRaw" :key="idx"
            class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: chartColors[idx] }"></span>
              <span class="font-bold text-sm text-gray-700 capitalize">{{ chartLabels[idx] }}</span>
            </div>
            <span class="font-black text-kelola-teal text-sm">Rp {{ formatNumber(val) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Transactions -->
    <section>
      <div class="flex items-center justify-between mb-6 mt-6">
        <h3 class="text-2xl font-extrabold tracking-tight">Riwayat <span class="text-kelola-dark/60">Bulan
            Ini</span></h3>
        <NuxtLink to="/transactions"
          class="text-sm font-bold text-kelola-teal hover:text-kelola-lime transition px-4 py-2 hover:bg-white/50 rounded-full">
          Lihat Semua</NuxtLink>
      </div>
      <div class="space-y-4">
        <div v-if="dashboard?.recentTransactions?.length === 0"
          class="text-center py-16 bg-white rounded-[2.5rem] shadow-sm border border-dashed border-gray-200">
          <p class="text-gray-600 font-bold mb-2">Belum ada transaksi.</p>
          <NuxtLink to="/transactions/add" class="text-kelola-lime font-bold text-sm hover:underline">Tambah Sekarang
          </NuxtLink>
        </div>

        <NuxtLink :to="`/transactions/${tx.id}`" v-for="tx in dashboard?.recentTransactions" :key="tx.id"
          class="flex items-center justify-between bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent hover:border-kelola-lime/20 hover:shadow-md transition cursor-pointer active:scale-[0.98]">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
              :class="tx.type === 'INCOME' ? 'bg-kelola-lime/30' : 'bg-red-50'">
              {{ getCategoryIcon(tx.category) }}
            </div>
            <div>
              <p class="font-bold text-gray-800 text-lg mb-0.5">{{ tx.category || 'Hutang' }}</p>
              <div class="flex items-center gap-2">
                <p class="text-xs text-gray-600 font-bold">{{ new Date(tx.date).toLocaleDateString('id-ID') }}</p>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="font-extrabold text-lg tracking-tight"
              :class="tx.type === 'INCOME' ? 'text-green-400' : 'text-red-500'">
              {{ tx.type === 'INCOME' ? '+' : '-' }} Rp {{ formatNumber(tx.amount) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { getCategoryIcon } from '~/utils/categories'

ChartJS.register(ArcElement, Tooltip, Legend)

const { session } = useCustomAuth()
useSeoMeta({ title: 'Dashboard - Kelola' })

const hasRequestedInsight = ref(false)
const { data: insight, pending: insightPending, refresh: refreshInsight } = useCsrfFetch('/api/ai/insights', {
  headers: useRequestHeaders(['cookie']),
  immediate: false
})

const getAIInsight = () => {
  hasRequestedInsight.value = true
  refreshInsight()
}
const { data: dashboard } = useCsrfFetch('/api/dashboard', { headers: useRequestHeaders(['cookie']) })

const hasExpenses = computed(() => {
  return dashboard.value?.recentTransactions?.some(t => t.type === 'EXPENSE') || false
})

const cryptoQuery = computed(() => {
  const owned = dashboard.value?.portfolios?.filter(p => p.type === 'CRYPTO').map(p => p.symbol.toLowerCase()) || []
  return Array.from(new Set(['bitcoin', 'ethereum', ...owned])).join(',')
})
const stockQuery = computed(() => {
  const owned = dashboard.value?.portfolios?.filter(p => p.type === 'STOCK').map(p => p.symbol.toUpperCase()) || []
  return Array.from(new Set(['BBCA', 'BBRI', ...owned])).join(',')
})

const { data: cryptoPrices } = useCsrfFetch(() => `/api/crypto?ids=${cryptoQuery.value}`)
const { data: sahamPrices } = useCsrfFetch(() => `/api/saham?symbols=${stockQuery.value}`)

const totalAssetValue = computed(() => {
  if (!dashboard.value?.portfolios) return 0

  let totalCrypto = 0
  let totalStock = 0

  for (const p of dashboard.value.portfolios) {
    if (p.type === 'CRYPTO') {
      const symbolId = p.symbol.toLowerCase()
      const currCrypto = cryptoPrices.value?.[symbolId]?.idr || 0
      totalCrypto += p.amount * currCrypto
    }
    else if (p.type === 'STOCK') {
      const stockCode = p.symbol.toUpperCase()
      const stockData = sahamPrices.value?.data?.results?.find(s => (s.symbol || '').toUpperCase() === stockCode)
      let currStock = 0
      if (stockData && stockData.close) {
        currStock = typeof stockData.close === 'number' ? stockData.close : parseInt(stockData.close.toString().replace(/[^0-9]/g, ''))
      }
      totalStock += (p.amount * 100) * currStock
    }
  }

  return totalCrypto + totalStock
})

// Chart Logic
const chartLabels = ref([])
const chartDataRaw = ref([])
const chartColors = ['#d6fb00', '#ecffb6', '#00545f', '#003d46', '#84cc16', '#a3e635', '#2dd4bf', '#0f766e']

const chartData = computed(() => {
  if (!dashboard.value?.recentTransactions) return { labels: [], datasets: [] }

  // Aggregate expenses by category for the pie chart
  const expenses = dashboard.value.recentTransactions.filter(t => t.type === 'EXPENSE')
  const catMap = {}
  expenses.forEach(t => {
    const rootName = t.category || 'Lainnya'
    catMap[rootName] = (catMap[rootName] || 0) + t.amount
  })

  // Sort and prep for view
  const sortedKeys = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])
  chartLabels.value = sortedKeys
  chartDataRaw.value = sortedKeys.map(k => catMap[k])

  return {
    labels: chartLabels.value,
    datasets: [{
      backgroundColor: chartColors.slice(0, sortedKeys.length),
      borderWidth: 0,
      data: chartDataRaw.value
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: {
      display: false
    }
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
    filter: blur(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.animate-fade-in-insight {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
