import { Controller } from "@hotwired/stimulus"

// Controls flash message behavior: show, auto-hide with pause on hover, dismiss on click,
// optional redirect on click, and add/remove visible classes for animations.
export default class extends Controller {
    static values = {
        timeout: { type: Number, default: 3000 }
    }

    connect() {
        // container holds individual flash items
        this.showAll()
        this._timers = new Map()

        console.log("FlashController connected")
    }

    showAll() {
        const items = Array.from(this.element.querySelectorAll('.flash-item'))
        items.forEach((item, i) => this._showItem(item, i))
    }

    _showItem(item, index) {
        // stagger entrance
        requestAnimationFrame(() => {
            setTimeout(() => {
                item.classList.add('show')
                // start auto hide timer
                this._startAutoHide(item)
                this._attachListeners(item)
            }, index * 80)
        })
    }

    _startAutoHide(item) {
        const timeout = Number(item.dataset.timeout) || this.timeoutValue || 6000
        if (timeout <= 0) return
        const id = setTimeout(() => this.dismiss(item), timeout)
        this._timers.set(item, id)
    }

    _clearTimer(item) {
        const id = this._timers.get(item)
        if (id) { clearTimeout(id); this._timers.delete(item) }
    }

    _attachListeners(item) {
        // pause on hover/focus
        const pause = () => this._clearTimer(item)
        const resume = () => this._startAutoHide(item)
        item.addEventListener('mouseenter', pause)
        item.addEventListener('focusin', pause)
        item.addEventListener('mouseleave', resume)
        item.addEventListener('focusout', resume)

        // click-to-dismiss or redirect, but if the click target is a link/button inside,
        // let that element handle it. The explicit close button should dismiss without redirect.
        // Delegated click handler for the item
        item.addEventListener('click', (e) => {
            const target = e.target
            console.debug('Flash item clicked:', { target, item })
            // if clicked a link or a non-close button inside, let default happen
            if (target.closest('a') || (target.closest('button') && !target.classList.contains('flash-close'))) return
            const redirect = item.dataset.redirectUrl
            if (redirect) {
                console.debug('Flash redirect to:', redirect)
                window.location.href = redirect
                return
            }
            // otherwise dismiss on click (but close button uses its own listener below)
            if (!target.closest('.flash-close')) this.dismiss(item)
        })

        // Explicit close button listener to ensure it always dismisses
        const close = item.querySelector('.flash-close')
        if (close) {
            close.addEventListener('click', (e) => {
                e.stopPropagation()
                console.debug('Flash close button clicked', { item })
                this.dismiss(item)
            })
        }

        // keyboard: escape to dismiss
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.dismiss(item)
        })
    }

    dismiss(item) {
        console.debug("Dismissing flash item", item)
        this._clearTimer(item)

        // add hide class to animate out
        item.classList.remove('show')
        item.classList.add('hide')

        // remove after animation completes
        const removeAfter = 220
        setTimeout(() => {
            try {
                if (item && item.parentNode) item.parentNode.removeChild(item)
            } catch (e) {
                console.error('Failed to remove flash item', e)
            }
        }, removeAfter)
    }

    // API: dismiss all
    dismissAll() {
        Array.from(this.element.querySelectorAll('.flash-item')).forEach(i => this.dismiss(i))
    }
}
