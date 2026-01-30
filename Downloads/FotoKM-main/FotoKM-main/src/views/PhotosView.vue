<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db, type TripEntry } from '../db';
import { useDateFormat } from '@vueuse/core';
import { Calendar, ArrowUpDown, Filter, X } from 'lucide-vue-next';
import ImageZoomViewer from '../components/ImageZoomViewer.vue';

const photos = ref<TripEntry[]>([]);
const startDate = ref<string>('');
const endDate = ref<string>('');
const sortOrder = ref<'newest' | 'oldest'>('newest');
const showFilters = ref(false);
const zoomedImage = ref<string | null>(null);

onMounted(async () => {
  const allTrips = await db.trips.orderBy('timestamp').reverse().toArray();
  photos.value = allTrips.filter(trip => trip.photo && trip.photo.length > 0);
});

const formatDate = (dateStr: string) => {
  return useDateFormat(dateStr, 'DD.MM.YYYY').value;
};

const filteredPhotos = computed(() => {
  let filtered = [...photos.value];
  
  if (startDate.value) {
    filtered = filtered.filter(trip => {
      const tripDate = new Date(trip.date);
      const start = new Date(startDate.value);
      return tripDate >= start;
    });
  }
  
  if (endDate.value) {
    filtered = filtered.filter(trip => {
      const tripDate = new Date(trip.date);
      const end = new Date(endDate.value);
      return tripDate <= end;
    });
  }
  
  filtered.sort((a, b) => {
    if (sortOrder.value === 'newest') {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });
  
  return filtered;
});

const clearFilters = () => {
  startDate.value = '';
  endDate.value = '';
  sortOrder.value = 'newest';
};

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'newest' ? 'oldest' : 'newest';
};

const openZoom = (photo: string) => {
  zoomedImage.value = photo;
};

const closeZoom = () => {
  zoomedImage.value = null;
};
</script>

<template>
  <div class="min-h-screen pb-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
    <div class="absolute inset-0 opacity-40">
      <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-emerald-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style="animation-delay: 4s"></div>
    </div>

    <div class="relative z-10 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto p-4 sm:p-6">
      <header class="flex justify-between items-center mb-4 sm:mb-6 pt-4">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white">Галерея</h1>
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="bg-emerald-500/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-emerald-400 border border-emerald-500/30">
            {{ filteredPhotos.length }} фото
          </div>
          <button 
            @click="showFilters = !showFilters"
            class="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all duration-300 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Filter class="w-5 h-5" />
          </button>
        </div>
      </header>

      <div v-if="showFilters" class="mb-4 sm:mb-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-4 sm:p-5 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base sm:text-lg font-bold text-slate-100 flex items-center">
            <Filter class="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-emerald-400" />
            Фільтри
          </h3>
          <button 
            @click="clearFilters"
            class="flex items-center space-x-1 text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <X class="w-3 sm:w-4 h-3 sm:h-4" />
            <span class="hidden sm:inline">Очистити</span>
          </button>
        </div>

        <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Від дати</label>
            <input 
              v-model="startDate"
              type="date" 
              class="w-full p-2.5 sm:p-3 bg-slate-800/80 rounded-xl text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/50 transition-all border border-emerald-500/20 min-h-[44px]"
            />
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">До дати</label>
            <input 
              v-model="endDate"
              type="date" 
              class="w-full p-2.5 sm:p-3 bg-slate-800/80 rounded-xl text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/50 transition-all border border-emerald-500/20 min-h-[44px]"
            />
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Сортування</label>
            <button 
              @click="toggleSort"
              class="w-full flex items-center justify-between p-2.5 sm:p-3 bg-slate-800/80 rounded-xl text-slate-100 text-xs sm:text-sm hover:bg-slate-800 transition-all border border-emerald-500/20 min-h-[44px]"
            >
              <span>{{ sortOrder === 'newest' ? 'Від нових до старих' : 'Від старих до нових' }}</span>
              <ArrowUpDown class="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-3 sm:space-y-4">
        <div v-if="filteredPhotos.length === 0" class="text-center py-20">
          <p class="text-base sm:text-lg font-medium text-slate-100">Немає фотографій</p>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">
            {{ photos.length === 0 ? 'Додайте записи з фото, щоб побачити їх тут' : 'Спробуйте змінити фільтри' }}
          </p>
        </div>

        <div 
          v-for="trip in filteredPhotos" 
          :key="trip.id" 
          class="group relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer"
          @click="openZoom(trip.photo)"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-emerald-500/20"></div>
          
          <div class="relative">
            <div class="h-40 sm:h-52 md:h-64 lg:h-72 w-full">
              <img 
                :src="trip.photo" 
                alt="Odometer" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                loading="lazy" 
              />
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 sm:p-5">
              <div class="flex justify-between items-end text-white">
                <div class="w-full">
                  <p class="font-semibold text-sm sm:text-lg flex items-center mb-1">
                    <Calendar class="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-emerald-400" />
                    {{ formatDate(trip.date) }}
                  </p>
                  <p v-if="trip.description" class="text-xs sm:text-sm text-slate-300 line-clamp-2">{{ trip.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ImageZoomViewer 
      v-if="zoomedImage" 
      :src="zoomedImage" 
      alt="Zoomed photo"
      @close="closeZoom"
    />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
