import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]

  connect() {
    this.isOpen = false
  }

  toggle(event) {
    event.preventDefault()
    event.stopPropagation()
    
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  open() {
    this.isOpen = true
    this.menuTarget.classList.remove("hidden")
    this.element.classList.add("dropdown-open")
    
    // Close dropdown when clicking outside
    document.addEventListener("click", this.closeOnOutsideClick)
  }

  close() {
    this.isOpen = false
    this.menuTarget.classList.add("hidden")
    this.element.classList.remove("dropdown-open")
    
    // Remove outside click listener
    document.removeEventListener("click", this.closeOnOutsideClick)
  }

  closeOnOutsideClick = (event) => {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  disconnect() {
    document.removeEventListener("click", this.closeOnOutsideClick)
  }
}
