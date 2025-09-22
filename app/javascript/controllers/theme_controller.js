import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["icon"]

    connect() {
        this.load()
    }

    load() {
        const theme = localStorage.getItem('theme') || this.preferred()
        this.apply(theme)
    }

    preferred() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    apply(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
            this.iconTarget && (this.iconTarget.textContent = '🌙')
        } else {
            document.documentElement.classList.remove('dark')
            this.iconTarget && (this.iconTarget.textContent = '☀️')
        }
        localStorage.setItem('theme', theme)
    }

    toggle() {
        const isDark = document.documentElement.classList.contains('dark')
        this.apply(isDark ? 'light' : 'dark')
    }
}
