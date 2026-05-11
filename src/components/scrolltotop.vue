<template>
  <transition name="scrolltotop-fade">
    <v-btn
      v-show="visible"
      icon="mdi-chevron-up"
      color="var(--leleo-vcard-color)"
      variant="tonal"
      class="scrolltotop-btn"
      aria-label="回到顶部"
      @click="scrollToTop"
    />
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.scrolltotop-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  width: 42px;
  height: 42px;
  backdrop-filter: blur(var(--leleo-blur));
}

.scrolltotop-fade-enter-active,
.scrolltotop-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.scrolltotop-fade-enter-from,
.scrolltotop-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 960px) {
  .scrolltotop-btn {
    bottom: 4.5rem;
    right: 1rem;
    width: 36px;
    height: 36px;
  }
}
</style>
