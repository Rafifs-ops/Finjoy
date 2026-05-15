<template>
  <div class="px-6 py-8 md:p-12 pb-32 max-w-2xl mx-auto h-[100dvh] flex flex-col relative">

    <div class="mb-6 flex-shrink-0">
      <div class="font-extrabold text-kelola-teal tracking-tighter flex items-center"><img
          src="/assets/images/logo-finjoy.png" alt="Finjoy Logo" class="h-20 w-auto" /> AI.</div>
      <p class="mt-1 font-semibold text-sm">Teman curhat keuangan cerdasmu.</p>
    </div>

    <!-- Chat Box -->
    <div
      class="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 overflow-y-auto mb-6 flex flex-col gap-4"
      ref="chatContainer">

      <!-- Welcome Message -->
      <div v-if="messages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
        <span class="text-6xl mb-4">💬</span>
        <h3 class="text-xl font-bold text-kelola-teal">Tanya Apa Aja!</h3>
        <p class="text-sm font-bold mt-2 text-gray-600">"Gimana caranya hemat buat beli tiket konser?" atau "Skenario
          investasi 1 juta sebulan."</p>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col"
        :class="msg.role === 'user' ? 'items-end' : 'items-start'">
        <div class="max-w-[85%] p-4 rounded-2xl"
          :class="msg.role === 'user' ? 'bg-gradient-to-br from-kelola-teal to-kelola-dark text-white rounded-br-none shadow-md shadow-kelola-teal/20' : 'bg-white/50 text-kelola-teal border border-white/20 rounded-bl-none backdrop-blur-sm'">
          <div class="text-[10px] font-black uppercase tracking-widest text-kelola-teal opacity-90 mb-1"
            v-if="msg.role !== 'user'">🤖 Kelola AI</div>
          <p class="text-sm whitespace-pre-wrap font-medium" v-html="formatMessage(msg.text)"></p>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex flex-col items-start animate-pulse mb-6">
        <div
          class="bg-white/50 backdrop-blur-sm p-4 rounded-2xl rounded-bl-none text-kelola-lime font-bold text-sm border border-white/20">
          Mikir bentar...
        </div>
      </div>
    </div>

    <!-- Input Box -->
    <form @submit.prevent="sendMessage" class="flex-shrink-0 relative mb-8">
      <input v-model="input" type="text" placeholder="Ketik pertanyaanmu..." required :disabled="loading"
        class="w-full bg-white/50 backdrop-blur-md border-2 border-transparent rounded-full py-4 pl-6 pr-16 text-kelola-teal font-bold focus:outline-none focus:border-kelola-lime shadow-xl transition-all disabled:opacity-50" />
      <button type="submit" :disabled="loading || !input.trim()"
        class="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-kelola-lime to-kelola-pale text-kelola-teal w-12 rounded-full flex items-center justify-center font-black hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(214,251,0,0.3)] disabled:opacity-50 border-2 border-transparent hover:border-white/20">
        &rarr;
      </button>
    </form>

  </div>
</template>

<script setup>
const input = ref('')
const messages = ref([])
const loading = ref(false)
const chatContainer = ref(null)
const { $csrfFetch } = useNuxtApp()

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }, 100)
}

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const userText = input.value
  messages.value.push({ role: 'user', text: userText })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const stream = await $csrfFetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userText,
        history: messages.value.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }))
      }),
      responseType: 'stream'
    })

    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let aiMsg = { role: 'model', text: '' }
    messages.value.push(aiMsg)

    // Hide loading directly when streaming begins
    loading.value = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      messages.value[messages.value.length - 1].text += chunk
      scrollToBottom()
    }
  } catch (e) {
    loading.value = false
    let errMsg = 'Maaf, ada gangguan koneksi. Coba lagi nanti ya! 😢'

    if (e.data && e.data.getReader) {
      try {
        const reader = e.data.getReader()
        let result = ''
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          result += decoder.decode(value, { stream: true })
        }
        const errData = JSON.parse(result)
        if (errData.statusMessage || errData.message) {
          errMsg = errData.statusMessage || errData.message
        }
      } catch (parseErr) {
        // Failed to parse error stream
      }
    } else if (e.data && (e.data.statusMessage || e.data.message)) {
      errMsg = e.data.statusMessage || e.data.message
    }

    if (!messages.value.some(m => m.text.includes(errMsg))) {
      messages.value.push({ role: 'model', text: errMsg })
    }
  }
}

const formatMessage = (text) => {
  // Simple markdown to HTML for bolding
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

useSeoMeta({ title: 'AI Chat - Kelola' })
</script>
