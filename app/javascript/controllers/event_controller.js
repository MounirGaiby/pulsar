import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="event"
export default class extends Controller {
  connect() {
  }

  broadcast(eventName) {
    const event = new CustomEvent(eventName, { bubbles: true })
    document.dispatchEvent(event)
  }
}
