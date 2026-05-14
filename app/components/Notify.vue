<template>
    <div>
        <Transition name="fade">
            <div v-if="isModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                @click.self="isModalOpen = false">
                <div class="w-full max-w-md p-6 mx-4 bg-kelola-teal shadow-2xl rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                        <img src="/assets/images/logo-finjoy.png" alt="" class="w-auto h-10">
                        <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p class="mb-6 text-white">
                        {{ props.msg }}
                    </p>

                    <div class="flex justify-end gap-3">
                        <button @click="isModalOpen = false"
                            class="px-4 py-2 text-sm font-medium text-kelola-teal transition-colors bg-kelola-lime rounded-lg hover:bg-kelola-lime/80">
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
const props = defineProps({
    msg: String,
    show: Boolean
})

// State untuk mengontrol tampil/tidaknya modal
const isModalOpen = ref(props.show)
</script>

<style scoped>
/* Efek animasi fade (opsional tapi membuat modal lebih halus) */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>