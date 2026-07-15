import { defineNuxtPlugin } from '#app'
import { useScreenStore } from '../stores/screen.js'
import { onMounted, onUnmounted } from 'vue'

export default defineNuxtPlugin((_nuxtApp) => {
  // Plugin runs after Pinia is installed. Use lifecycle hooks to access the store safely.
  onMounted(() => {
    const screen = useScreenStore()
    const updateSize = () => {
      screen.setSize(window.innerWidth, window.innerHeight)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener('resize', updateSize)
    })
  })
})