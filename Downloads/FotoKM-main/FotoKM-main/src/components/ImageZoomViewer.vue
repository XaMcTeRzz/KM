<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { X, RotateCcw } from 'lucide-vue-next';

interface Props {
  src: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Image'
});

const emit = defineEmits<{
  close: []
}>();

const scale = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const positionStart = ref({ x: 0, y: 0 });

const minScale = 1;
const maxScale = 5;

const containerRef = ref<HTMLElement | null>(null);

let lastTapTime = 0;
const doubleTapDelay = 300;

const transformStyle = computed(() => {
  return `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`;
});

const canZoom = computed(() => scale.value < maxScale);
const canReset = computed(() => scale.value > minScale);

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.min(maxScale, Math.max(minScale, scale.value + delta));
  
  if (newScale !== scale.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updateZoomPosition(newScale, x, y, rect.width, rect.height);
  }
};

const updateZoomPosition = (newScale: number, touchX: number, touchY: number, containerWidth: number, containerHeight: number) => {
  const scaleChange = newScale / scale.value;
  
  const newX = touchX - (touchX - position.value.x) * scaleChange;
  const newY = touchY - (touchY - position.value.y) * scaleChange;
  
  position.value = {
    x: Math.min(containerWidth / 2, Math.max(-containerWidth / 2, newX)),
    y: Math.min(containerHeight / 2, Math.max(-containerHeight / 2, newY))
  };
  
  scale.value = newScale;
};

let initialDistance = 0;
let initialScale = 1;

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0]!;
    const touch2 = e.touches[1]!;
    initialDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    initialScale = scale.value;
    e.preventDefault();
  } else if (e.touches.length === 1) {
    isDragging.value = true;
    const touch = e.touches[0]!;
    dragStart.value = {
      x: touch.clientX,
      y: touch.clientY
    };
    positionStart.value = { ...position.value };
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    if (tapLength < doubleTapDelay && tapLength > 0) {
      handleDoubleTap();
      e.preventDefault();
    }
    lastTapTime = currentTime;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0]!;
    const touch2 = e.touches[1]!;
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const scaleRatio = currentDistance / initialDistance;
    const newScale = Math.min(maxScale, Math.max(minScale, initialScale * scaleRatio));
    
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect();
      const x = centerX - rect.left;
      const y = centerY - rect.top;
      updateZoomPosition(newScale, x, y, rect.width, rect.height);
    }
    e.preventDefault();
  } else if (e.touches.length === 1 && isDragging.value) {
    const touch = e.touches[0]!;
    const deltaX = touch.clientX - dragStart.value.x;
    const deltaY = touch.clientY - dragStart.value.y;
    
    position.value = {
      x: positionStart.value.x + deltaX,
      y: positionStart.value.y + deltaY
    };
  }
};

const handleTouchEnd = () => {
  isDragging.value = false;
};

const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    isDragging.value = true;
    dragStart.value = {
      x: e.clientX,
      y: e.clientY
    };
    positionStart.value = { ...position.value };
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = e.clientX - dragStart.value.x;
    const deltaY = e.clientY - dragStart.value.y;
    
    position.value = {
      x: positionStart.value.x + deltaX,
      y: positionStart.value.y + deltaY
    };
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleDoubleClick = () => {
  if (scale.value === 1) {
    scale.value = 2;
  } else {
    scale.value = 1;
    position.value = { x: 0, y: 0 };
  }
};

const handleDoubleTap = () => {
  if (scale.value === 1) {
    scale.value = 2;
  } else {
    scale.value = 1;
    position.value = { x: 0, y: 0 };
  }
};

const resetZoom = () => {
  scale.value = 1;
  position.value = { x: 0, y: 0 };
};

const handleClose = () => {
  emit('close');
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div 
    class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center overflow-hidden"
    @touchmove.self.prevent
  >
    <div 
      ref="containerRef"
      class="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @dblclick="handleDoubleClick"
    >
      <img
        ref="imageRef"
        :src="src"
        :alt="alt"
        class="max-w-full max-h-full object-contain transition-transform will-change-transform"
        :style="{ transform: transformStyle }"
        draggable="false"
      />
    </div>

    <button
      @click="handleClose"
      class="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all duration-300 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Close"
    >
      <X class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
    </button>

    <div v-if="canReset" class="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-3 md:space-x-4 z-10">
      <div class="bg-white/10 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm font-medium min-h-[40px] sm:min-h-[44px] flex items-center">
        {{ Math.round(scale * 100) }}%
      </div>
      
      <button
        @click="resetZoom"
        class="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all duration-300 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
        aria-label="Reset zoom"
      >
        <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>
    </div>

    <div v-if="canZoom" class="absolute bottom-4 sm:bottom-6 md:bottom-8 right-3 sm:right-6 z-10">
      <div class="bg-emerald-500/20 backdrop-blur-md rounded-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-emerald-400 text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-[40px] md:min-h-[44px] flex items-center">
        Use pinch to zoom
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .absolute {
    position: absolute !important;
  }
}
</style>
