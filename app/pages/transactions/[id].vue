<template>
  <div class="px-6 py-8 md:p-12 pb-32 max-w-2xl mx-auto">
    <div class="mb-8">
      <NuxtLink to="/transactions"
        class="text-kelola-lime text-sm font-bold flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
        &larr; Kembali
      </NuxtLink>
      <h1 class="text-4xl font-extrabold text-kelola-teal tracking-tighter">Detail Transaksi</h1>
      <p class="mt-1 font-semibold text-sm">Review detail riwayat pengeluaran atau pendapatan.</p>
    </div>

    <!-- Error/Loading state -->
    <div v-if="pending" class="text-center py-10 opacity-50">Memuat detail...</div>
    <div v-else-if="error" class="bg-red-50 text-red-500 font-bold p-4 rounded-xl text-center">{{ error.message }}</div>

    <div v-else-if="transaction"
      class="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border border-white/20 relative overflow-hidden">
      <!-- Decoration -->
      <div v-if="transaction.type === 'INCOME'"
        class="absolute -top-10 -right-10 w-32 h-32 bg-kelola-lime rounded-full blur-[30px] opacity-30"></div>
      <div v-else class="absolute -top-10 -right-10 w-32 h-32 bg-red-100 rounded-full blur-[30px] opacity-30"></div>

      <!-- Core Info -->
      <div class="text-center mb-8 relative z-10">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{{ new
          Date(transaction.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        <h2 class="text-5xl font-black tracking-tighter"
          :class="transaction.type === 'INCOME' ? 'text-kelola-teal' : 'text-kelola-lime'">
          {{ transaction.type === 'INCOME' ? '+' : '-' }}Rp {{ transaction.amount.toLocaleString('id-ID') }}
        </h2>
        <div class="inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
          :class="transaction.type === 'INCOME' ? 'bg-kelola-lime/20 text-kelola-lime' : 'bg-red-50 text-red-500'">
          {{ transaction.type }}
        </div>
      </div>

      <hr class="border-gray-100 my-6" />

      <!-- Meta Info -->
      <div class="space-y-4 relative z-10">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Kategori</span>
          <span class="font-bold text-kelola-teal bg-kelola-teal/5 px-3 py-1 rounded-lg">{{ transaction.category === 'Tabungan' && transaction.saving ? `Tabungan - ${transaction.saving.name}` : (transaction.category || (transaction.debtId ? 'Hutang' : 'Tanpa Kategori')) }}</span>
        </div>

        <div class="flex justify-between items-center" v-if="transaction.priority">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Prioritas</span>
          <span class="font-bold px-3 py-1 rounded-lg text-xs" :class="{
            'bg-red-100 text-red-700': transaction.priority === 'WAJIB',
            'bg-orange-100 text-orange-700': transaction.priority === 'PENTING',
            'bg-gray-100 text-gray-700': transaction.priority === 'TIDAK PENTING'
          }">{{ transaction.priority }}</span>
        </div>

        <div class="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Catatan / Deskripsi</span>
          <p class="font-medium text-gray-700 text-sm italic">{{ transaction.description || 'Tidak ada catatan khusus.'
            }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const transactionId = route.params.id

const { data: transaction, pending, error } = useFetch(`/api/transactions/${transactionId}`, {
  headers: useRequestHeaders(['cookie'])
})

useSeoMeta({ title: 'Detail Transaksi - Kelola' })
</script>
