import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="sidebar"
export default class extends Controller {
  static targets = ["menu"]

  connect() {
    console.log("Sidebar controller connected")

    document.addEventListener("sidebar:toggle", () => {
      this.toggle()
    })
  }

  toggle() {
    this.menuTarget.classList.toggle("hidden")
  }
}

