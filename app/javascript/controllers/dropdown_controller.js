import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["menu"]
    static values = {
        matchTrigger: Boolean,
        align: String
    }

    toggle(event) {
        event.preventDefault()

        const trigger = event.currentTarget
        const wasHidden = this.menuTarget.classList.contains('hidden')

        // toggle visibility
        this.menuTarget.classList.toggle('hidden')

        // If matching trigger width is enabled, set minWidth
        if (!this.menuTarget.classList.contains('hidden') && this.matchTriggerValue && trigger) {
            const tw = trigger.getBoundingClientRect().width
            this.menuTarget.style.minWidth = `${tw}px`
        } else if (wasHidden && !this.matchTriggerValue) {
            this.menuTarget.style.minWidth = ''
        }

        // position: try to keep inside viewport; prefer align value
        if (!this.menuTarget.classList.contains('hidden')) {
            this._positionMenu(trigger)
        }

        const expanded = this.menuTarget.classList.contains('hidden') ? 'false' : 'true'
        trigger.setAttribute('aria-expanded', expanded)
    }

    connect() {
        console.log("Dropdown controller connected")
        this.outsideListener = (e) => {
            // if click is outside entire component, close
            if (!this.element.contains(e.target)) {
                this._close()
                return
            }

            // if click is inside the menu, do not close UNLESS the clicked element
            // is a link/button OR has data-dropdown-close="true"
            const insideMenu = this.menuTarget.contains(e.target)
            if (insideMenu) {
                const el = e.target.closest('a, button, [data-dropdown-close="true"]')
                if (el) {
                    // allow closing when clicking actionable items
                    this._close()
                } else {
                    // otherwise keep open
                }
            }
        }
        document.addEventListener('click', this.outsideListener)

        // close on escape
        this.escapeListener = (e) => {
            if (e.key === 'Escape') this._close()
        }
        document.addEventListener('keydown', this.escapeListener)
    }

    disconnect() {
        document.removeEventListener('click', this.outsideListener)
        document.removeEventListener('keydown', this.escapeListener)
    }

    _close() {
        this.menuTarget.classList.add('hidden')
        const btn = this.element.querySelector('[aria-expanded]')
        btn && btn.setAttribute('aria-expanded', 'false')
        this.menuTarget.style.minWidth = ''
    }

    _positionMenu(trigger) {
        // reset alignment first
        this.menuTarget.style.right = ''
        this.menuTarget.style.left = ''

        const align = this.hasAlignValue ? this.alignValue : 'left'
        const rect = this.menuTarget.getBoundingClientRect()
        const tr = trigger.getBoundingClientRect()

        // if matchTrigger, ensure minWidth is set already
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth

        if (align === 'right') {
            // try to align menu's right edge with trigger's right edge
            const desiredLeft = tr.right - rect.width
            if (desiredLeft < 0) {
                // would overflow left, pin to 4px
                this.menuTarget.style.left = '4px'
            } else if (tr.right > viewportWidth) {
                this.menuTarget.style.left = `${Math.max(4, viewportWidth - rect.width - 4)}px`
            } else {
                this.menuTarget.style.left = `${desiredLeft}px`
            }
        } else {
            // left align (default)
            const desiredRight = tr.left + rect.width
            if (desiredRight > viewportWidth) {
                // overflow right -> try to shift left so it fits
                const left = Math.max(4, viewportWidth - rect.width - 4)
                this.menuTarget.style.left = `${left}px`
            } else {
                // align left to trigger
                this.menuTarget.style.left = `${tr.left}px`
            }
        }

        // ensure menu stays within viewport vertically as well
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight
        if (rect.bottom > viewportHeight) {
            // try to flip above the trigger
            const topAbove = tr.top - rect.height - 8
            if (topAbove > 0) {
                this.menuTarget.style.top = `${topAbove}px`
            }
        }
    }
}
