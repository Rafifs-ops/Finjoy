<template>
  <div class="flex flex-col h-[100dvh] md:flex-row text-kelola-teal font-sans overflow-hidden">
    <!-- Sidebar for Desktop -->
    <aside
      class="hidden md:flex flex-col w-64 bg-kelola-teal/90 backdrop-blur-xl text-white p-6 shadow-2xl z-20 border-r border-white/10">
      <div class="mb-10 flex items-center mx-auto">
        <img src="/assets/images/logo-finjoy.png" alt="Finjoy Logo" class="h-20 w-auto" />
      </div>
      <nav class="flex-1 space-y-2">
        <NuxtLink to="/"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
            </path>
          </svg>
          Dashboard
        </NuxtLink>
        <NuxtLink to="/transactions"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
            </path>
          </svg>
          Transaksi
        </NuxtLink>
        <NuxtLink to="/portfolios"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6">
            </path>
          </svg>
          Aset
        </NuxtLink>
        <NuxtLink to="/budgets"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Anggaran
        </NuxtLink>
        <NuxtLink to="/debts"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Hutang
        </NuxtLink>
        <NuxtLink to="/savings"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
            </path>
          </svg>
          Tabungan
        </NuxtLink>
        <NuxtLink to="/ai"
          class="group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm"
          active-class="bg-kelola-lime text-kelola-teal shadow-lg shadow-kelola-lime/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">
            </path>
          </svg>
          AI Chat
        </NuxtLink>
      </nav>
      <div class="mt-4 space-y-3">
        <NuxtLink v-if="!session?.user?.is_premium" to="/premium"
          class="block text-center px-4 py-3 rounded-2xl bg-gradient-to-br from-kelola-lime to-kelola-pale text-kelola-teal transition font-bold shadow-xl hover:scale-105 active:scale-95 border border-white/20">
          Upgrade Premium</NuxtLink>
        <button @click="handleSignOut"
          class="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl transition font-medium text-white/70 hover:text-white">Logout</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto w-full p-6 md:p-10 pb-32 md:pb-10 relative">
      <div
        class="absolute top-0 right-0 w-[500px] h-[500px] bg-kelola-teal/20 rounded-full blur-[120px] -z-10 pointer-events-none">
      </div>
      <slot />
    </main>

    <!-- Mobile Nav Backdrop to catch click events -->
    <div v-if="isDataMenuOpen" @click="closeDataMenu"
      class="md:hidden fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-opacity"></div>

    <!-- Mobile Bottom Navigation -->
    <nav
      class="md:hidden fixed bottom-0 left-0 w-full bg-kelola-teal/90 backdrop-blur-2xl text-white flex justify-between px-6 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50 rounded-t-[2.5rem] border-t border-white/10">

      <!-- Home -->
      <NuxtLink to="/" class="flex flex-col items-center justify-center text-white/50 w-12"
        active-class="text-kelola-lime scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-[9px] font-black uppercase tracking-wider">Home</span>
      </NuxtLink>

      <!-- Data -->
      <div class="relative flex flex-col items-center justify-center w-12 text-white">
        <button @click="toggleDataMenu"
          class="flex flex-col items-center justify-center w-full focus:outline-none transition-transform"
          :class="{ 'text-kelola-lime scale-110': isDataActive || isDataMenuOpen, 'text-white/50': !isDataActive && !isDataMenuOpen }">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1 transition-transform"
            :class="{ 'scale-105': isDataMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-[9px] font-black uppercase tracking-wider">Data</span>
        </button>

        <!-- Dropdown Menu -->
        <transition enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 translate-y-4 scale-95"
          enter-to-class="transform opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 translate-y-0 scale-100"
          leave-to-class="transform opacity-0 translate-y-4 scale-95">
          <div v-if="isDataMenuOpen"
            class="absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-kelola-teal/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_-5px_30px_rgba(0,0,0,0.5)] w-40 z-50 overflow-hidden flex flex-col">
            <NuxtLink @click="closeDataMenu" to="/transactions"
              class="px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
              active-class="bg-white/10 text-kelola-lime">
              <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                </path>
              </svg>
              Transaksi
            </NuxtLink>
            <NuxtLink @click="closeDataMenu" to="/debts"
              class="px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
              active-class="bg-white/10 text-kelola-lime">
              <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Hutang
            </NuxtLink>
            <NuxtLink @click="closeDataMenu" to="/budgets"
              class="px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
              active-class="bg-white/10 text-kelola-lime">
              <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                </path>
              </svg>
              Anggaran
            </NuxtLink>
            <NuxtLink @click="closeDataMenu" to="/savings"
              class="px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
              active-class="bg-white/10 text-kelola-lime">
              <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
              Tabungan
            </NuxtLink>
          </div>
        </transition>
      </div>

      <!-- FAB Add Button -->
      <div class="relative -top-8 flex justify-center w-16">
        <NuxtLink to="/transactions/add"
          class="absolute flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-kelola-lime to-kelola-pale text-kelola-teal shadow-[0_10px_30px_rgba(214,251,0,0.4)] hover:scale-110 active:scale-95 transition-transform z-50 border-4 border-kelola-teal/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Assets -->
      <NuxtLink to="/portfolios" class="flex flex-col items-center justify-center text-white/50 w-12"
        active-class="text-kelola-lime scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span class="text-[9px] font-black uppercase tracking-wider">Aset</span>
      </NuxtLink>

      <!-- AI -->
      <NuxtLink to="/ai" class="flex flex-col items-center justify-center text-white/50 w-12"
        active-class="text-kelola-lime scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span class="text-[9px] font-black uppercase tracking-wider">AI</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
const { signOut, session } = useCustomAuth()
const handleSignOut = () => signOut()

const isDataMenuOpen = ref(false)
const toggleDataMenu = () => {
  isDataMenuOpen.value = !isDataMenuOpen.value
}
const closeDataMenu = () => {
  isDataMenuOpen.value = false
}

const route = useRoute()
const isDataActive = computed(() => ['/transactions', '/debts', '/budgets', '/savings'].some(path => route.path.startsWith(path)))
</script>
