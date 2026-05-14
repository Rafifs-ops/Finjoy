<template>
  <div class="space-y-6 animate-fade-in pb-20 md:pb-0">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Transaksi</h1>
        <p class="mt-1 font-semibold text-sm">Catatan arus kasmu.</p>
      </div>
      <div class="hidden md:flex gap-3">
        <a href="/api/reports" download
          class="bg-white/50 backdrop-blur-md text-kelola-teal px-5 py-3 rounded-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border-2 border-white/20 hover:border-kelola-lime">
          ⬇ Excel
        </a>
        <NuxtLink to="/transactions/add"
          class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-6 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(214,251,0,0.3)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent hover:border-white/20">
          + Tambah
        </NuxtLink>
      </div>
    </div>

    <!-- Summary Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" v-if="!pending && transactions?.length > 0">
      <div v-if="hasExpenses"
        class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white/20 flex flex-col items-center">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Prioritas Pengeluaran</h3>
        <div class="h-48 w-full relative">
          <ClientOnly>
            <Doughnut :data="priorityChartData" :options="chartOptions" />
          </ClientOnly>
        </div>
      </div>
      <div
        class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white/20 flex flex-col items-center">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Arus Kas</h3>
        <div class="h-48 w-full relative">
          <ClientOnly>
            <Doughnut :data="cashflowChartData" :options="chartOptions" />
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex gap-3 overflow-x-auto p-4 scrollbar-hide snap-x flex-1">
        <button v-for="f in ['SEMUA', 'WAJIB', 'PENTING', 'TIDAK PENTING']" :key="f" @click="filter = f"
          class="snap-start px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border-2 uppercase tracking-wide"
          :class="filter === f ? 'bg-kelola-lime text-kelola-teal border-transparent shadow-lg scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-kelola-lime'">
          {{ f === 'SEMUA' ? 'Semua Kategori' : f }}
        </button>
      </div>

      <!-- Month Selector -->
      <div class="relative min-w-[180px]">
        <input type="month" v-model="selectedMonth"
          class="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-kelola-teal focus:outline-none focus:border-kelola-lime transition-all shadow-sm cursor-pointer uppercase tracking-tight" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20 bg-white/50 rounded-3xl animate-pulse">
      <p class="font-bold">Memuat data...</p>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-4">
      <div v-if="filteredTransactions.length === 0"
        class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
        <div class="text-5xl mb-4">📭</div>
        <p class="text-gray-400 font-bold mb-2">Belum ada transaksi di kategori ini.</p>
      </div>

      <NuxtLink :to="`/transactions/${tx.id}`" v-for="tx in filteredTransactions" :key="tx.id"
        class="flex items-center justify-between bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent hover:border-kelola-lime/20 hover:shadow-md transition cursor-pointer active:scale-[0.98]">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner relative"
            :class="tx.type === 'INCOME' ? 'bg-kelola-lime/30' : 'bg-red-50'">
            {{ getCategoryIcon(tx.category) }}
            <!-- Receipt icon indicator -->
            <div v-if="tx.receiptUrl"
              class="absolute -top-1 -right-1 bg-kelola-lime text-kelola-teal w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm font-bold border border-white/20">
              📄
            </div>
          </div>
          <div>
            <p class="font-bold text-gray-800 text-lg mb-0.5">{{ tx.category === 'Tabungan' && tx.saving ?
              `Tabungan - ${tx.saving.name}` : (tx.category || (tx.debtId ? 'Hutang' : 'Tanpa Kategori')) }}</p>
            <div class="flex items-center gap-2">
              <p class="text-xs text-gray-400 font-semibold">{{ new Date(tx.date).toLocaleDateString('id-ID', {
                day:
                  'numeric', month: 'short'
              }) }}</p>
              <span v-if="tx.debtId"
                class="text-[9px] font-black px-2 py-0.5 rounded-md text-white bg-purple-500 uppercase tracking-widest">HUTANG</span>
            </div>
            <p v-if="tx.description" class="text-[10px] text-gray-400 mt-1 italic">{{ tx.description }}</p>
          </div>
        </div>
        <div class="text-right flex flex-col items-end">
          <p class="font-extrabold text-lg tracking-tight"
            :class="tx.type === 'INCOME' ? 'text-green-400' : 'text-red-400'">
            {{ tx.type === 'INCOME' ? '+' : '-' }} Rp {{ formatNumber(tx.amount) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { getCategoryIcon } from '~/utils/categories'

ChartJS.register(ArcElement, Tooltip, Legend)

const { session } = useCustomAuth()
const { csrf } = useCsrf()
const selectedMonth = ref(new Date().toISOString().substring(0, 7)) // 'YYYY-MM'

const { data: transactions, pending } = useCsrfFetch(() => {
  const [year, month] = selectedMonth.value.split('-')
  return `/api/transactions?month=${month}&year=${year}`
}, { headers: useRequestHeaders(['cookie']) })

const hasExpenses = computed(() => {
  return transactions.value?.some(t => t.type === 'EXPENSE') || false
})

const filter = ref('SEMUA')

useSeoMeta({ title: 'Transaksi - Kelola' })

const priorityChartData = computed(() => {
  if (!transactions.value) return { labels: [], datasets: [] }
  const expenses = transactions.value.filter(t => t.type === 'EXPENSE')
  const wajib = expenses.filter(t => t.priority === 'WAJIB').reduce((sum, t) => sum + t.amount, 0)
  const penting = expenses.filter(t => t.priority === 'PENTING').reduce((sum, t) => sum + t.amount, 0)
  const tidakPenting = expenses.filter(t => t.priority === 'TIDAK PENTING').reduce((sum, t) => sum + t.amount, 0)

  return {
    labels: ['Wajib', 'Penting', 'Tidak Penting'],
    datasets: [{
      backgroundColor: ['#ef4444', '#f97316', '#00545f'],
      borderWidth: 0,
      data: [wajib, penting, tidakPenting]
    }]
  }
})

const cashflowChartData = computed(() => {
  if (!transactions.value) return { labels: [], datasets: [] }
  const income = transactions.value.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.value.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)

  return {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [{
      backgroundColor: ['#d6fb00', '#ef4444'],
      borderWidth: 0,
      data: [income, expense]
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 8, font: { family: 'sans-serif', weight: 'bold', size: 10 } }
    }
  }
}

const filteredTransactions = computed(() => {
  if (!transactions.value) return []
  if (filter.value === 'SEMUA') return transactions.value
  return transactions.value.filter(t => t.priority === filter.value)
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}
</script>
