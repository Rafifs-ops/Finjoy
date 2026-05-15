<template>
  <div class="px-6 py-8 md:p-12 pb-32 max-w-4xl mx-auto">

    <!--Header-->
    <div class="flex flex-col md:flex-row items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Aset Kripto & Saham</h1>
        <p class="mt-1 font-semibold text-sm">Kelola portofolio Kripto & Saham Anda dengan harga live.
        </p>
      </div>
      <div class="flex gap-2 mt-4 md:mt-0">
        <button @click="openModal('CRYPTO')"
          class="bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal px-5 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(214,251,0,0.3)] hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-transparent">
          + Kripto
        </button>
        <button @click="openModal('STOCK')"
          class="bg-gradient-to-br from-kelola-teal to-kelola-dark text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform uppercase tracking-widest text-xs border border-white/10">
          + Saham
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="portfolios?.length !== 0" class="grid grid-rows-2 md:grid-cols-2 gap-4 mb-8 md:mb-0">
      <div
        class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col justify-center">
        <span class="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Total Kripto</span>
        <span class="text-2xl font-black text-kelola-teal">
          {{ pendingCrypto ? 'Memuat...' : 'Rp ' + totalCryptoValue.toLocaleString('id-ID') }}
        </span>
      </div>
      <div
        class="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col justify-center">
        <span class="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Total Saham</span>
        <span class="text-2xl font-black text-kelola-teal">
          {{ pendingSaham ? 'Memuat...' : 'Rp ' + totalStockValue.toLocaleString('id-ID') }}
        </span>
      </div>
    </div>

    <!-- Asset List -->
    <div v-if="pending" class="text-center py-10 font-black text-kelola-teal animate-pulse">Memuat Aset...</div>
    <div v-else-if="portfolios.length === 0"
      class="text-center py-12 bg-white/50 backdrop-blur-md rounded-3xl border border-white/20 border-dashed">
      <span class="text-4xl inline-block mb-3">📈</span>
      <h3 class="text-xl font-bold text-kelola-teal mb-1">Belum ada aset</h3>
      <p class="text-sm text-gray-600 font-bold">Tambahkan saham atau kripto pertamamu.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="asset in portfolios" :key="asset.id"
        class="bg-white/80 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-kelola-lime/20 transition-all">
        <!--Asset Symbol-->
        <div class="flex flex-col md:flex-row items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black tracking-tighter"
            :class="asset.type === 'CRYPTO' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'">
            {{ asset.symbol.substring(0, 3).toUpperCase() }}
          </div>
          <div>
            <h3 class="font-bold text-kelola-teal">{{ asset.symbol.toUpperCase() }}</h3>
            <p class="text-xs text-gray-600 font-bold">{{ asset.amount }} {{ asset.type === 'STOCK' ? 'Lot' : 'Koin' }}
            </p>
          </div>
        </div>

        <!--Asset Value-->
        <div class="flex flex-col md:flex-row items-end gap-4">
          <div class="text-right">
            <p class="text-[10px] font-bold uppercase tracking-widest">Estimasi Nilai (Live)</p>
            <p class="font-black text-kelola-teal">Rp {{ getLiveTargetValue(asset).toLocaleString('id-ID') }}</p>
          </div>
          <button @click="deleteAsset(asset.id)"
            class="bg-red-50 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors">
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Add Asset Modal -->
    <div v-if="showAddModal"
      class="fixed inset-0 bg-kelola-dark/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        class="bg-white/90 backdrop-blur-2xl rounded-3xl w-full max-w-md p-8 shadow-2xl scale-100 animate-fade-in-up border border-white/20">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-kelola-teal tracking-tighter">Tambah {{ form.type === 'STOCK' ? 'Saham' :
            'Kripto' }}</h2>
          <button @click="showAddModal = false"
            class="text-gray-400 hover:text-gray-800 text-2xl font-light">&times;</button>
        </div>

        <form @submit.prevent="addAsset" class="space-y-4">

          <div>
            <label class="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 ml-1">
              Pilih Simbol {{ form.type === 'STOCK' ? 'Saham' : 'Kripto' }}
            </label>

            <!-- Searchable Dropdown (Datalist) -->
            <input v-if="form.type === 'CRYPTO'" list="crypto-list" v-model="form.symbol"
              placeholder="Ketik/Cari Koin (cth: bitcoin)..." required
              class="w-full bg-white/50 border-2 border-transparent rounded-2xl py-3 px-4 text-kelola-teal font-bold focus:outline-none focus:border-kelola-lime transition-all uppercase"
              autocomplete="off" />
            <input v-else list="stock-list" v-model="form.symbol" placeholder="Ketik/Cari Saham (cth: BBCA)..." required
              class="w-full bg-white/50 border-2 border-transparent rounded-2xl py-3 px-4 text-kelola-teal font-bold focus:outline-none focus:border-kelola-lime transition-all uppercase"
              autocomplete="off" />

            <datalist id="crypto-list">
              <option v-for="coin in cryptoOptions" :key="coin" :value="coin">{{ (coin || '').toUpperCase() }}</option>
            </datalist>
            <datalist id="stock-list">
              <option v-for="saham in stockOptions" :key="saham" :value="saham">{{ (saham || '').toUpperCase() }}
              </option>
            </datalist>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {{ form.type === 'STOCK' ? 'Jumlah Lot (1 Lot = 100 lembar)' : 'Jumlah Koin' }}
            </label>
            <input v-model="form.quantity" type="number" step="0.0000001" required placeholder="0.0"
              class="w-full bg-white/50 border-2 border-transparent rounded-2xl py-3 px-4 text-kelola-teal font-bold focus:outline-none focus:border-kelola-lime transition-all" />
          </div>

          <button type="submit" :disabled="formLoading || !form.symbol"
            class="w-full mt-6 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 border-b-4 border-white/20">
            {{ formLoading ? 'Menyimpan...' : 'Simpan Aset' }}
          </button>
        </form>
      </div>
    </div>

    <Notify v-if="showNotify" :msg="notifyMsg" :show="showNotify" />
  </div>
</template>

<script setup>
const { $csrfFetch } = useNuxtApp()
// Mendapatkan Seluruh data Aset user
const { data: portfolios, pending, refresh: refreshPortfolios } = useCsrfFetch('/api/portfolios', { headers: useRequestHeaders(['cookie']) })

// Membuat data query url API untuk mengambil harga crypto dan saham
const cryptoQuery = computed(() => {
  const base = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'dogecoin', 'pepe', 'shiba-inu']
  const owned = portfolios.value?.filter(p => p.type === 'CRYPTO').map(p => p.symbol.toLowerCase()) || []
  return Array.from(new Set([...base, ...owned])).join(',')
})
const stockQuery = computed(() => {
  const base = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'GOTO', 'TLKM', 'ASII', 'AMMN', 'BREN', 'BRPT']
  const owned = portfolios.value?.filter(p => p.type === 'STOCK').map(p => p.symbol.toUpperCase()) || []
  return Array.from(new Set([...base, ...owned])).join(',')
})
// cth output: "bitcoin,ethereum,binancecoin,ripple,cardano,solana,dogecoin,pepe,shiba-inu"

// Mengambil data harga crypto dan saham
const { data: cryptoPrices, pending: pendingCrypto } = useCsrfFetch(() => `/api/crypto?ids=${cryptoQuery.value}`)
const { data: sahamPrices, pending: pendingSaham } = useCsrfFetch(() => `/api/saham?symbols=${stockQuery.value}`)

// Compute dropdown options safely
const cryptoOptions = computed(() => {
  if (!cryptoPrices.value || typeof cryptoPrices.value !== 'object') return cryptoQuery.value.split(',').filter(Boolean)
  // Filter out meta keys like 'error' or 'statusCode' if it's an error object
  return Object.keys(cryptoPrices.value).filter(key => key !== 'error' && key !== 'statusCode')
})
const stockOptions = computed(() => {
  if (!sahamPrices.value?.data?.results || !Array.isArray(sahamPrices.value.data.results)) {
    return stockQuery.value.split(',').filter(Boolean)
  }
  return sahamPrices.value.data.results
    .map(s => s.symbol)
    .filter(t => typeof t === 'string' && t.length > 0)
})
// cth output: ["BBCA","BBRI","BMRI","BBNI","GOTO","TLKM","ASII","AMMN","BREN","BRPT"]

// Fungsi untuk menghitung jumlah aset * harga live aset saat ini (real-time)
const getLiveTargetValue = (asset) => {
  if (asset.type === 'CRYPTO' && cryptoPrices.value) {
    const symbolId = asset.symbol.toLowerCase()
    const priceCache = cryptoPrices.value[symbolId]
    if (priceCache && priceCache.idr) {
      return asset.amount * priceCache.idr
    }
  } else if (asset.type === 'STOCK' && sahamPrices.value?.data?.results && Array.isArray(sahamPrices.value.data.results)) {
    const symbolCode = (asset.symbol || '').toUpperCase()
    const stockData = sahamPrices.value.data.results.find(s => (s.symbol || '').toUpperCase() === symbolCode)
    if (stockData && stockData.close) {
      // 1 lot = 100 lembar
      const price = typeof stockData.close === 'number' ? stockData.close : parseInt(stockData.close.toString().replace(/[^0-9]/g, ''))
      return (asset.amount || 0) * 100 * (price || 0)
    }
  }
  // Fallback to buy price if live API fails
  return asset.amount * (asset.buyPrice || 0)
}

// Menghitung total nilai aset crypto dan saham
const totalCryptoValue = computed(() => {
  if (!portfolios.value) return 0
  return portfolios.value.filter(p => p.type === 'CRYPTO').reduce((acc, p) => acc + getLiveTargetValue(p), 0)
})
const totalStockValue = computed(() => {
  if (!portfolios.value) return 0
  return portfolios.value.filter(p => p.type === 'STOCK').reduce((acc, p) => acc + getLiveTargetValue(p), 0)
})

const showAddModal = ref(false)
const formLoading = ref(false)
const form = ref({ type: 'CRYPTO', symbol: '', name: '', quantity: null, buy_price: null })
const showNotify = ref(false)
const notifyMsg = ref('')

const openModal = (type) => {
  form.value = { type, symbol: '', name: 'Asset', quantity: null, buy_price: null }
  showAddModal.value = true
}

const addAsset = async () => {
  formLoading.value = true
  try {
    form.value.symbol = form.value.symbol.toLowerCase()
    form.value.name = form.value.symbol.toUpperCase()

    // Ambil harga live dari API untuk menghitung total pembelian
    let livePricePerUnit = 0
    if (form.value.type === 'CRYPTO') {
      const res = await $csrfFetch(`/api/crypto?ids=${form.value.symbol}`)
      livePricePerUnit = res?.[form.value.symbol]?.idr || 0
    } else if (form.value.type === 'STOCK') {
      const res = await $csrfFetch(`/api/saham?symbols=${form.value.name}`)
      const stockData = res?.data?.results?.find(s => (s.symbol || '').toUpperCase() === form.value.name)
      if (stockData && stockData.close) {
        livePricePerUnit = typeof stockData.close === 'number' ? stockData.close : parseInt(stockData.close.toString().replace(/[^0-9]/g, ''))
      }
    }

    // Hitung total pengeluaran (Saham: 1 Lot = 100 lembar)
    if (form.value.type === 'STOCK') {
      form.value.buy_price = form.value.quantity * 100 * livePricePerUnit
    } else {
      form.value.buy_price = form.value.quantity * livePricePerUnit
    }

    await $csrfFetch('/api/portfolios', { method: 'POST', body: form.value, headers: useRequestHeaders(['cookie']) })
    showAddModal.value = false
    notifyMsg.value = 'Aset berhasil ditambahkan'
    showNotify.value = true
    await refreshPortfolios()
  } catch (e) {
    notifyMsg.value = e.data?.message || 'Gagal menambah aset'
    showNotify.value = true
  } finally {
    formLoading.value = false
    setTimeout(() => {
      showNotify.value = false
    }, 3000)
  }
}

const deleteAsset = async (id) => {
  if (!confirm('Hapus aset ini?')) return
  await $csrfFetch('/api/portfolios', { method: 'DELETE', body: { id }, headers: useRequestHeaders(['cookie']) })
  refreshPortfolios()
}

useSeoMeta({ title: 'Aset Portofolio Live - Kelola' })
</script>
