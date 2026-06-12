import { defineStore, acceptHMRUpdate } from '#imports'

export const useConfirmStore_11 = defineStore(
  'ConfirmStore',
  {
    state: () => ({
      confirm: null,
      loading: false
    }),

    getters: {
      data: state => state.confirm
    },

    actions: {
      setLoading(loading) {
        this.loading = loading
      },

      hide() {
        this.confirm = null
        this.loading = false
      },

      show(props) {
        // this.confirm = props,
        this.confirm = {
          color: 'primary',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          persistent: false,
          ...props
        }
      },

      async confirmAction() {
        if (!this.confirm?.onConfirm)
          return this.hide()

        try {
          this.loading = true

          await this.confirm.onConfirm()

          this.hide()
        } catch (error) {
          this.loading = false
          throw error
        }
      }
    }
  }
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(
      useConfirmStore_11,
      import.meta.hot
    )
  )
}