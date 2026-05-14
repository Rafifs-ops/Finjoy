<template>
  <div class="px-6 py-8 md:p-12 pb-32 max-w-2xl mx-auto">
    <div class="mb-8">
      <NuxtLink to="/debts"
        class="text-kelola-lime text-sm font-bold flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
        &larr; Kembali ke Daftar Hutang
      </NuxtLink>
      <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Bayar Hutang</h1>
      <p class="mt-1 font-semibold text-sm">Catat pelunasan / cicilan untuk mengurangi sisa hutang secara otomatis.</p>
    </div>

    <!-- Error/Loading state -->
    <div v-if="pending" class="text-center py-10 opacity-50">Memuat detail hutang...</div>
    <div v-else-if="error" class="bg-red-50 text-red-500 font-bold p-4 rounded-xl text-center">Data hutang tidak
      ditemukan.</div>

    <div v-else-if="debt" class="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/20">

      <div class="bg-kelola-teal/5 p-6 rounded-2xl mb-8 border border-gray-100/30">
        <h2 class="font-bold text-kelola-teal mb-1">{{ debt.title }}</h2>
        <div class="flex justify-between mt-4">
          <div>
            <p class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Sisa Hutang</p>
            <p class="font-extrabold text-kelola-lime text-xl">Rp {{ debt.remaining_amount.toLocaleString('id-ID') }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Total Hutang</p>
            <p class="font-bold text-gray-800">Rp {{ debt.total_amount.toLocaleString('id-ID') }}</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitPayment" class="space-y-5">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nominal Cicilan
            (Rp)</label>
          <div class="relative">
            <span class="absolute left-5 top-4 font-bold text-kelola-teal">Rp</span>
            <input v-model="amount" type="number" required :max="debt.remaining_amount"
              class="w-full bg-white/50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-5 text-kelola-teal font-extrabold text-xl focus:outline-none focus:border-kelola-lime transition-all shadow-inner" />
          </div>
          <p class="text-[10px] text-gray-400 mt-2 ml-2 italic">Minimal Rp 1, maksimal sesuai sisa hutang.</p>
        </div>

        <button type="submit" :disabled="loading || !amount || amount <= 0"
          class="w-full mt-6 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(214,251,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 border-b-4 border-white/20">
          {{ loading ? 'MEMPROSES...' : 'Bayar Hutang' }}
        </button>
      </form>

    </div>

    <Notify v-if="showNotify" :msg="notifyMsg" :show="showNotify" />
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const showNotify = ref(false)
const notifyMsg = ref('')
const debtId = route.params.id
const { $csrfFetch } = useNuxtApp()

// Re-using debt listing API to get the specific debt. (Filtering client side for simplicity here)
const { data: debts, pending, error } = useCsrfFetch('/api/debts', { headers: useRequestHeaders(['cookie']) })

const debt = computed(() => {
  return debts.value?.find(d => d.id === debtId)
})

const amount = ref(null)
const loading = ref(false)

const submitPayment = async () => {
  if (amount.value > debt.value.remaining_amount) {
    notifyMsg.value = "Nominal pembayaran melebihi sisa hutang!"
    showNotify.value = true
    return
  }

  loading.value = true
  try {
    // We create an expense transaction linked to this debt
    // The backend in /api/transactions/index.ts automatically decrements debt.remaining_amount!
    // But since the user wants a dedicated API or robust feature, let's call transaction API
    await $csrfFetch('/api/transactions', {
      method: 'POST',
      headers: useRequestHeaders(['cookie']),
      body: {
        type: 'EXPENSE',
        amount: parseFloat(amount.value),
        categoryId: '525dec73-5d8b-41df-9171-e1f55905458e',
        priority: 'PENTING',
        debtId: debt.value.id,
        date: new Date().toISOString(),
        description: `Cicilan untuk: ${debt.value.title}`
      }
    })
    notifyMsg.value = 'Hutang berhasil dibayar!'
    showNotify.value = true
    setTimeout(() => router.push('/debts'), 2000)
  } catch (e) {
    notifyMsg.value = e.data.message || 'Terjadi kesalahan saat mencatat pembayaran.'
    showNotify.value = true
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Bayar Hutang - Kelola' })
</script>
