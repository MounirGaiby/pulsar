import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["menu"]

    toggle(event) {
        event.preventDefault()
        this.menuTarget.classList.toggle('hidden')
        const expanded = this.menuTarget.classList.contains('hidden') ? 'false' : 'true'
        event.currentTarget.setAttribute('aria-expanded', expanded)
    }

    connect() {
        this.outsideListener = (e) => {
            if (!this.element.contains(e.target)) {
                this.menuTarget.classList.add('hidden')
                const btn = this.element.querySelector('button')
                btn && btn.setAttribute('aria-expanded', 'false')
            }
        }
        document.addEventListener('click', this.outsideListener)
    }

    disconnect() {
        document.removeEventListener('click', this.outsideListener)
    }
}
