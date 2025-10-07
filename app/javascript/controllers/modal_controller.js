import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["title"]
  static values = {
    backdropDismissable: { type: Boolean, default: true }
  }

  connect() {
    this.boundHandleFrameClick = this.handleFrameClick.bind(this)
    document.addEventListener('click', this.boundHandleFrameClick, true)
    
    this.boundBeforeStreamRender = this.handleBeforeStreamRender.bind(this)
    document.addEventListener('turbo:before-stream-render', this.boundBeforeStreamRender)
    
    this.element._modalController = this
  }

  disconnect() {
    document.removeEventListener('click', this.boundHandleFrameClick, true)
    document.removeEventListener('turbo:before-stream-render', this.boundBeforeStreamRender)
    
    if (this.element.open) {
      this.element.close()
    }
    
    delete this.element._modalController
  }

  handleFrameClick(event) {
    const link = event.target.closest('a[data-turbo-frame="modal-content"]')
    if (link) {
      const title = link.dataset.modalTitleParam
      if (title && this.hasTitleTarget) {
        this.titleTarget.textContent = title
      }
      this.open()
    }
  }

  handleBeforeStreamRender(event) {
    const streamAction = event.target.getAttribute('action')
    if (streamAction === 'refresh') {
      this.close()
    }
  }

  open(title = null) {
    if (!this.element.open) {
      if (title && this.hasTitleTarget) {
        this.titleTarget.textContent = title
      }
      this.element.showModal()
    }
  }

  close(event) {
    if (event) {
      event.preventDefault()
    }
    
    if (this.element.open) {
      this.element.close()
    }
  }
}

