<template>
  <div class="pb-20 md:pb-0 animate-fade-in z-10 w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Hutang</h1>
        <p class="mt-1 font-semibold text-sm">Kelola komitmen finansialmu.</p>
      </div>
      <button @click="showAddModal = true"
        class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-6 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(214,251,0,0.3)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent">
        + Catat
      </button>
    </div>

    <!-- Stats -->
    <div
      class="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20 mb-8 flex items-center justify-between group hover:shadow-md transition">
      <div>
        <p class="text-xs font-black text-gray-700 uppercase tracking-widest">Total Belum Dibayar</p>
        <h2 class="text-md md:text-4xl font-black text-red-500 tracking-tighter mt-2">Rp {{ formatNumber(totalUnpaid) }}
        </h2>
      </div>
      <div
        class="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
        📉
      </div>
    </div>

    <div v-if="pending" class="text-center py-20 flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-kelola-lime border-t-kelola-teal rounded-full animate-spin shadow-lg"></div>
      <p class="mt-4 font-black text-kelola-teal">Memuat catatan...</p>
    </div>

    <div v-else class="space-y-5">
      <!--Jika Hutang tidak ada-->
      <div v-if="debts?.length === 0"
        class="text-center py-16 bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20 border-dashed">
        <div class="text-5xl mb-4 drop-shadow-sm">🤝</div>
        <p class="text-gray-600 font-bold mb-3">Wah hebat! Kamu tidak punya hutang aktif.</p>
      </div>

      <!-- Menampilkan data hutang -->
      <div v-for="d in debts" :key="d.id"
        class="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20 hover:shadow-md transition group relative overflow-hidden">
        <div v-if="d.remaining_amount <= 0"
          class="bg-kelola-lime mb-5 text-kelola-teal text-[10px] text-center font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border border-white/20 shadow-sm">
          Lunas</div>
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-4">
            <div>
              <h3 class="font-black text-gray-800 text-2xl tracking-tight mb-1"
                :class="d.remaining_amount <= 0 ? 'line-through text-gray-400' : ''">{{ d.title }}</h3>
              <p v-if="d.dueDate" class="text-xs font-bold text-gray-600 mt-0.5 uppercase tracking-wide">Tenggat: <span
                  class="text-kelola-teal font-black underline underline-offset-2 decoration-kelola-lime/50">{{ new
                    Date(d.dueDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                  }}</span></p>
            </div>
          </div>
          <button @click="deleteDebt(d.id)"
            class="w-10 h-10 flex items-center justify-center bg-red-50/80 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md border border-red-100/50 flex-shrink-0"
            title="Hapus Hutang">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
              </path>
            </svg>
          </button>
        </div>

        <div
          class="flex flex-col md:flex-row md:justify-between md:items-end bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p class="font-extrabold text-gray-400 text-lg">Rp {{ formatNumber(d.total_amount) }}</p>
          </div>
          <div class="md:text-right">
            <p class="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1"
              :class="d.remaining_amount <= 0 ? 'text-gray-600' : ''">Sisa Dibayar</p>
            <p class="font-black text-3xl tracking-tighter"
              :class="d.remaining_amount <= 0 ? 'text-kelola-sea' : 'text-red-500'">Rp {{
                formatNumber(d.remaining_amount) }}</p>
          </div>
        </div>

        <div v-if="d.remaining_amount > 0"
          class="mt-6 pt-6 border-t border-dashed border-gray-200 flex items-center justify-between">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ Math.round((d.total_amount -
            d.remaining_amount) / d.total_amount * 100) }}% Lunas</span>
          <NuxtLink :to="`/debts/${d.id}/pay`"
            class="text-xs font-black text-kelola-teal hover:text-kelola-lime transition-all tracking-widest uppercase bg-kelola-teal/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-kelola-lime/30">
            Bayar Cicilan
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Modal Catat Hutang -->
    <div v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-kelola-dark/60 backdrop-blur-md p-4 animate-fade-in">
      <div
        class="bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative border border-white/20">
        <button @click="showAddModal = false"
          class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 class="text-3xl font-extrabold text-kelola-teal mb-8 tracking-tighter">Catat Hutang</h2>

        <form @submit.prevent="saveDebt" class="space-y-5">
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Nama Hutang</label>
            <input v-model="form.title" type="text" required placeholder="Misal: Cicilan Motor"
              class="w-full bg-white/50 rounded-2xl py-5 px-5 font-bold text-gray-700 text-lg focus:outline-none focus:ring-4 focus:ring-kelola-lime/30 border-2 border-transparent focus:border-kelola-lime/50 shadow-inner transition-all placeholder:font-medium placeholder:text-gray-300" />
          </div>
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Total Hutang
              (Rp)</label>
            <div class="relative">
              <span
                class="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-kelola-teal select-none">Rp</span>
              <input v-model="form.total_amount" type="number" required placeholder="0"
                class="w-full bg-white/50 rounded-2xl py-5 pl-14 pr-5 font-black text-kelola-teal text-3xl focus:outline-none focus:ring-4 focus:ring-kelola-lime/30 border-2 border-transparent focus:border-kelola-lime/50 shadow-inner transition-all" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Tanggal Jatuh Tempo
              (Opsional)</label>
            <input v-model="form.dueDate" type="date"
              class="w-full bg-white/50 rounded-2xl py-5 px-5 font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-kelola-lime/30 border-2 border-transparent focus:border-kelola-lime/50 shadow-inner transition-all" />
          </div>
          <button type="submit" :disabled="saving"
            class="w-full mt-6 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex justify-center shadow-[0_10px_30px_rgba(214,251,0,0.3)] disabled:opacity-50 border-b-4 border-white/20">
            {{ saving ? 'MENYIMPAN...' : 'SIMPAN CATATAN' }}
          </button>
        </form>
      </div>
    </div>

    <Notify v-if="showNotify" :msg="notifyMsg" :show="showNotify" />
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Hutang - Kelola' })

const { $csrfFetch } = useNuxtApp()
const { data: debts, pending, refresh } = useCsrfFetch('/api/debts')

const showAddModal = ref(false)
const saving = ref(false)
const form = ref({ title: '', total_amount: '', dueDate: '' })
const showNotify = ref(false)
const notifyMsg = ref('')

const totalUnpaid = computed(() => {
  if (!debts.value) return 0
  return debts.value.reduce((acc, d) => acc + d.remaining_amount, 0)
})

const saveDebt = async () => {
  if (!form.value.title || !form.value.total_amount) return
  saving.value = true
  try {
    await $csrfFetch('/api/debts', {
      method: 'POST',
      body: {
        title: form.value.title,
        total_amount: Number(form.value.total_amount),
        dueDate: form.value.dueDate || null
      }
    })
    showAddModal.value = false
    form.value = { title: '', total_amount: '', dueDate: '' }
    notifyMsg.value = 'Hutang berhasil ditambahkan'
    showNotify.value = true
    await refresh()
  } catch (e) {
    notifyMsg.value = e.data.message || 'Gagal menyimpan catatan hutang'
    showNotify.value = true
  } finally {
    saving.value = false
    setTimeout(() => {
      showNotify.value = false
    }, 2000)
  }
}

const deleteDebt = async (id) => {
  if (confirm('Yakin ingin menghapus hutang ini beserta semua riwayat cicilannya?')) {
    try {
      await $csrfFetch('/api/debts', {
        method: 'DELETE',
        body: { id }
      })
      notifyMsg.value = 'Hutang berhasil dihapus'
      showNotify.value = true
      await refresh()
    } catch (e) {
      notifyMsg.value = e.data.message || 'Gagal menghapus hutang'
      showNotify.value = true
    } finally {
      setTimeout(() => {
        showNotify.value = false
      }, 2000)
    }
  }
}

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)
</script>
