<template>
  <div class="max-w-xl mx-auto space-y-8 animate-fade-in pb-20 md:pb-0 relative z-10 w-full">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-4">
      <NuxtLink to="/transactions"
        class="w-12 h-12 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-kelola-teal shadow-md hover:scale-105 transition-transform border border-white/20">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </NuxtLink>
      <h1 class="text-3xl font-extrabold text-kelola-teal tracking-tighter">Tambah Transaksi</h1>
    </div>

    <!-- OCR Banner for Premium -->
    <div @click="handleOCR"
      class="bg-kelola-lime/10 backdrop-blur-md border-2 border-kelola-lime/30 p-4 rounded-2xl flex items-center justify-between shadow-sm group cursor-pointer hover:bg-kelola-lime/20 transition">
      <div>
        <h3 class="font-bold text-kelola-teal text-sm mb-1 uppercase tracking-wider">🌟 Auto Scan Struk</h3>
        <p class="text-xs text-kelola-teal font-bold uppercase tracking-wide">Foto/upload struk dan biarkan AI kami yang
          mengisinya!</p>
      </div>
      <div
        class="w-12 h-12 bg-gradient-to-br from-kelola-lime to-kelola-pale text-kelola-teal rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
        📸
      </div>
    </div>

    <!-- Hidden file input for OCR -->
    <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="onFileSelected" />


    <form @submit.prevent="submitTransaction"
      class="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-white/40 space-y-6">

      <!-- Type Toggle -->
      <div class="flex bg-kelola-teal/5 p-1.5 rounded-2xl shadow-inner border border-gray-100/30">
        <button type="button" @click="form.type = 'EXPENSE'"
          class="flex-1 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition"
          :class="form.type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'">Pengeluaran</button>
        <button type="button" @click="form.type = 'INCOME'"
          class="flex-1 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition"
          :class="form.type === 'INCOME' ? 'bg-kelola-lime text-kelola-teal shadow-md' : 'text-gray-500 hover:text-gray-700'">Pemasukan</button>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Jumlah</label>
        <div class="relative">
          <span
            class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-kelola-teal select-none">Rp</span>
          <input v-model="form.amount" type="number" required placeholder="0"
            class="w-full bg-white/50 border-2 border-gray-100/40 rounded-3xl py-6 pl-16 pr-6 text-4xl font-black text-kelola-teal focus:outline-none focus:border-kelola-lime focus:bg-white transition-all shadow-inner" />
        </div>
      </div>

      <!-- Category -->
      <div>
        <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Kategori</label>
        <div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
          <div v-for="cat in availableCategories" :key="cat.name" @click="form.category = cat.name"
            class="flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all border-2 group"
            :class="form.category === cat.name ? 'border-kelola-teal bg-kelola-lime shadow-md shadow-kelola-teal/20 scale-105' : 'border-gray-100 bg-gray-50 hover:border-kelola-sea/30 hover:bg-white'">
            <span class="text-2xl mb-1 group-hover:scale-110 transition-transform"
              :class="form.category === cat.name ? 'opacity-100' : 'opacity-80'">{{ cat.icon || '📌' }}</span>
            <span class="text-[9px] font-black text-center leading-tight truncate w-full"
              :class="form.category === cat.name ? 'text-kelola-yellow' : 'text-gray-600'">{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <!-- Saving Target Dropdown (Visible only if category is 'Tabungan') -->
      <div v-if="isSavingCategory"
        class="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
        <label class="block text-xs font-black text-green-800 uppercase tracking-widest mb-2">Pilih Tabungan</label>
        <div class="relative">
          <select v-model="form.savingId" required
            class="w-full bg-white/70 border-2 border-green-200 rounded-xl py-3 px-4 font-bold text-green-900 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-inner appearance-none">
            <option value="" disabled>-- Pilih Tabungan Aktif --</option>
            <option v-for="s in savings" :key="s.id" :value="s.id">
              {{ s.name }} (Target: Rp {{ formatNumber(s.targetAmount) }})
            </option>
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p v-if="savings?.length === 0" class="text-xs text-red-500 font-bold mt-2">
          Anda belum memiliki tabungan aktif. <NuxtLink to="/savings" class="underline">Buat tabungan</NuxtLink>.
        </p>
      </div>

      <!-- Priority -->
      <div v-if="form.type === 'EXPENSE'">
        <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Prioritas</label>
        <div class="flex gap-2">
          <button type="button" v-for="p in ['WAJIB', 'PENTING', 'TIDAK PENTING']" :key="p" @click="form.priority = p"
            class="flex-1 py-3 rounded-2xl border-2 font-black text-[10px] md:text-xs uppercase tracking-wider transition"
            :class="form.priority === p ? 'border-kelola-lime bg-kelola-lime text-kelola-teal shadow-md' : 'border-gray-100 bg-gray-50/50 text-gray-600 font-bold hover:border-kelola-lime/30 hover:bg-white'">
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Date & Notes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100/60 pt-6">
        <div>
          <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Tanggal</label>
          <input v-model="form.date" type="date" required
            class="w-full bg-white/50 border-2 border-transparent rounded-xl py-3 px-4 font-bold text-kelola-teal focus:outline-none focus:border-kelola-lime focus:bg-white transition-all shadow-inner" />
        </div>
        <div>
          <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Catatan</label>
          <input v-model="form.description" type="text" placeholder="Detail transaksi..."
            class="w-full bg-white/50 border-2 border-transparent rounded-xl py-3 px-4 font-bold text-gray-700 focus:outline-none focus:border-kelola-lime focus:bg-white transition-all placeholder:font-medium placeholder:text-gray-400 shadow-inner" />
        </div>
      </div>

      <button type="submit" :disabled="loading || isAnalyzing"
        class="w-full mt-4 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_10px_40px_rgba(214,251,0,0.3)] hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50 border-b-4 border-white/20">
        {{ loading ? 'MENYIMPAN...' : isAnalyzing ? 'MENGANALISIS STRUK...' : 'SIMPAN' }}
      </button>
    </form>

    <Notify v-if="showNotify" :msg="notifyMsg" :show="showNotify" />
  </div>
</template>

<script setup>
import { CATEGORIES } from '~/utils/categories'

const router = useRouter()
const showNotify = ref(false)
const notifyMsg = ref('')
const fileInput = ref(null)
const isAnalyzing = ref(false)
const { $csrfFetch } = useNuxtApp()
useSeoMeta({ title: 'Tambah Transaksi - Kelola' })

const { data: savings } = useCsrfFetch('/api/savings')

const form = ref({
  type: 'EXPENSE',
  amount: '',
  category: 'Makanan',
  savingId: '',
  priority: 'PENTING',
  date: new Date().toISOString().split('T')[0],
  description: '',
})

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)

const loading = ref(false)

const availableCategories = computed(() => {
  return CATEGORIES.filter(c => c.type === form.value.type) || []
})

const isSavingCategory = computed(() => {
  return form.value.category.toLowerCase() === 'tabungan'
})

watch(() => form.value.type, (newType) => {
  const cats = CATEGORIES.filter(c => c.type === newType) || []
  if (cats.length > 0) form.value.category = cats[0].name
})

const handleOCR = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isAnalyzing.value = true
  notifyMsg.value = 'Sedang membaca struk... Harap tunggu!'
  showNotify.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    const data = await $csrfFetch('/api/ai/ocr', {
      method: 'POST',
      body: formData
    })

    if (data) {
      if (data.type) form.value.type = data.type

      // Delay applying category slightly to ensure watchers have updated availableCategories based on new type
      setTimeout(() => {
        if (data.category) form.value.category = data.category
      }, 50)

      if (data.amount) form.value.amount = data.amount
      if (data.date) form.value.date = data.date
      if (data.description) form.value.description = data.description
      if (data.priority) form.value.priority = data.priority

      notifyMsg.value = 'Struk berhasil dibaca! Silakan periksa kembali.'
      showNotify.value = true
      setTimeout(() => showNotify.value = false, 3000)
    }
  } catch (e) {
    notifyMsg.value = e.data?.statusMessage || 'Gagal memproses struk.'
    showNotify.value = true
    setTimeout(() => showNotify.value = false, 3000)
  } finally {
    isAnalyzing.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const submitTransaction = async () => {
  if (!form.value.amount || !form.value.category) return
  if (isSavingCategory.value && !form.value.savingId) {
    notifyMsg.value = 'Silakan pilih tabungan aktif'
    showNotify.value = true
    setTimeout(() => showNotify.value = false, 3000)
    return
  }

  loading.value = true
  try {
    const res = await $csrfFetch('/api/transactions', {
      method: 'POST',
      body: {
        ...form.value,
        amount: Number(form.value.amount)
      }
    })

    if (res?.savingFulfilled) {
      notifyMsg.value = res.message
      showNotify.value = true
      setTimeout(() => {
        router.push('/savings/history')
      }, 3000)
    } else {
      router.push('/transactions')
    }
  } catch (e) {
    if (e.data?.message) {
      notifyMsg.value = e.data.message
      showNotify.value = true
    } else if (e.data?.statusMessage) {
      notifyMsg.value = e.data.statusMessage
      showNotify.value = true
    } else {
      notifyMsg.value = 'Gagal menyimpan transaksi.'
      showNotify.value = true
    }
    setTimeout(() => showNotify.value = false, 3000)
  } finally {
    loading.value = false
  }
}
</script>
