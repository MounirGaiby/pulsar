import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="modal"
export default class extends Controller {
  connect() {
    // Auto-open modal when frame loads
    const dialog = this.element.querySelector('dialog')
    if (dialog && !dialog.open) {
      dialog.showModal()
    }

    // Setup close handlers
    this.setupCloseHandlers()
  }

  disconnect() {
    const dialog = this.element.querySelector('dialog')
    if (dialog && dialog.open) {
      dialog.close()
    }
  }

  setupCloseHandlers() {
    // Close on ESC key
    document.addEventListener('keydown', this.handleEscape.bind(this))
    
    // Close when clicking backdrop
    const dialog = this.element.querySelector('dialog')
    if (dialog) {
      dialog.addEventListener('click', this.handleBackdropClick.bind(this))
    }
  }

  handleEscape(event) {
    if (event.key === 'Escape') {
      this.close()
    }
  }

  handleBackdropClick(event) {
    const dialog = event.target
    if (event.target === dialog) {
      // Clicked on backdrop (the dialog element itself, not its children)
      this.close()
    }
  }

  close() {
    const dialog = this.element.querySelector('dialog')
    if (dialog && dialog.open) {
      dialog.close()
      // Clear the turbo frame content to fully reset
      setTimeout(() => {
        this.element.innerHTML = ''
      }, 300)
    }
  }
}
