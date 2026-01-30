<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { Home, Image as ImageIcon } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const navigation = [
  { name: 'Поїздки', path: '/', icon: Home },
  { name: 'Всі фото', path: '/photos', icon: ImageIcon },
];

const isActive = (path: string) => route.path === path;

const navigate = (path: string) => {
  router.push(path);
};

let lastScrollY = 0;
const isNavVisible = ref(true);

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  const scrollDelta = 10;
  
  if (Math.abs(currentScrollY - lastScrollY) > scrollDelta) {
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      isNavVisible.value = false;
    } else if (currentScrollY < lastScrollY) {
      isNavVisible.value = true;
    }
    lastScrollY = currentScrollY;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
    <div class="absolute inset-0 opacity-40 pointer-events-none">
      <div class="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
      <div class="absolute top-20 sm:top-40 right-5 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute bottom-10 sm:bottom-20 left-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style="animation-delay: 4s"></div>
    </div>

    <RouterView class="relative z-10" />

    <nav class="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300" :class="isNavVisible ? 'translate-y-0' : 'translate-y-full'">
      <div class="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 pt-1.5 sm:pt-2">
        <div class="bg-slate-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/20 overflow-hidden">
          <div class="flex items-stretch">
            <button
              v-for="item in navigation"
              :key="item.path"
              @click="navigate(item.path)"
              class="flex-1 flex flex-col items-center py-2 sm:py-2.5 md:py-3 px-1.5 sm:px-2 transition-all duration-300 group relative"
              :class="isActive(item.path) ? 'text-white' : 'text-white/70 hover:text-white'"
            >
              <div
                v-if="isActive(item.path)"
                class="absolute inset-x-1.5 sm:inset-x-2 top-0 h-0.5 bg-gradient-to-r from-white via-white/90 to-white rounded-full"
              ></div>
              
              <div class="relative mb-0.5 sm:mb-1">
                <div 
                  class="absolute inset-0 rounded-full blur-lg transition-all duration-300"
                  :class="isActive(item.path) ? 'bg-gradient-to-r from-white to-white/80 opacity-60' : 'bg-transparent group-hover:from-white/30 group-hover:to-white/20 opacity-0'"
                ></div>
                <component :is="item.icon" class="w-5 h-5 sm:w-6 sm:h-6 relative transition-transform duration-300 group-hover:scale-110" />
              </div>
              
              <span class="text-[10px] sm:text-xs font-bold transition-all duration-300" :class="isActive(item.path) ? 'translate-y-0' : 'opacity-80 group-hover:opacity-100'">
                {{ item.name }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
