import { defineNuxtPlugin } from '#app'
import { useScreenStore } from '../stores/screen'
export default defineNuxtPlugin((_nuxtApp) => {
  console.log('Plugin injected by my-module!')

  const screen = useScreenStore()

  const updateSize = () => {
    screen.setSize(window.innerWidth, window.innerHeight)
  }

  updateSize()

  window.addEventListener('resize', updateSize)
})

// const screen = useScreenStore()

// const updateSize = () => {
//   screen.setSize(window.innerWidth, window.innerHeight)
// }

// onMounted(() => {
//   updateSize()

//   window.addEventListener('resize', updateSize)
// })

// onUnmounted(() => {
//   window.removeEventListener('resize', updateSize)
// })