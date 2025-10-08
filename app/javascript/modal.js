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

  get modalBox() {
    return this.element?.querySelector('.modal-box')
  },

  open(options = {}) {
    if (!this.controller) {
      console.error('Modal controller not found')
      return
    }

    this.controller.open(options)
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
