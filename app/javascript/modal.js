window.Modal = {
  get element() {
    return document.getElementById('app-modal')
  },

  get controller() {
    return this.element?._modalController
  },

  get frame() {
    return this.element?.querySelector('turbo-frame#modal-content')
  },

  open(options = {}) {
    if (!this.controller) {
      console.error('Modal controller not found')
      return
    }

    this.controller.open(options.title)

    if (options.url && this.frame) {
      this.frame.src = options.url
    }
  },

  close() {
    if (this.controller) {
      this.controller.close()
    }
  }
}

document.addEventListener('modal:open', (event) => {
  Modal.open(event.detail)
})

document.addEventListener('modal:close', () => {
  Modal.close()
})
