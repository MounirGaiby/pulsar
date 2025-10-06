import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="table"
export default class extends Controller {
    static values = {
        sortColumn: String,
        sortDirection: String
    }

    connect() {
    }

    sort(event) {
        event.preventDefault()

        const column = event.currentTarget.dataset.tableColumn
        const currentColumn = this.sortColumnValue
        const currentDirection = this.sortDirectionValue

        let newDirection = 'asc'

        if (currentColumn === column && currentDirection === 'asc') {
            newDirection = 'desc'
        }

        this.updateSort(column, newDirection)
    }

    updateSort(column, direction) {
        const url = new URL(window.location)

        if (column) {
            url.searchParams.set('sort', column)
            url.searchParams.set('direction', direction)
        } else {
            url.searchParams.delete('sort')
            url.searchParams.delete('direction')
        }

        // Dispatch event so filter controller can sync
        document.dispatchEvent(new CustomEvent('table:sort-changed', {
            detail: { column, direction },
            bubbles: true
        }))

        // Reset to page 1 when sorting changes
        url.searchParams.delete('page')
        // Replace history URL so refresh preserves sort/filter params
        try { window.history.replaceState({}, '', url.toString()) } catch (e) { }

        // If user provided an explicit frame id on the table element (data-table-frame-id), use it.
        const explicitFrame = this.element.getAttribute('data-table-frame-id')
        if (explicitFrame) {
            if (typeof Turbo !== 'undefined' && Turbo.visit) { Turbo.visit(url.toString(), { frame: explicitFrame }) }
            else { window.location.href = url.toString() }
            return
        }

        // Fallback: try to find the closest turbo-frame, else use _top
        const frame = this.element.closest('turbo-frame')
        const frameId = frame?.id || '_top'
        if (typeof Turbo !== 'undefined' && Turbo.visit) { Turbo.visit(url.toString(), { frame: frameId }) }
        else { window.location.href = url.toString() }
    }

    // Handle responsive table behavior

    toggleSelectAll(event) {
        const isChecked = event.target.checked
        const checkboxes = this.element.querySelectorAll('tbody input[type="checkbox"]')

        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked
        })

        this.updateSelectedIds()
    }

    toggleSelect(event) {
        const checkbox = event.target
        this.updateSelectAllCheckbox()
        this.updateSelectedIds()
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = this.element.querySelector('thead input[type="checkbox"]')
        const checkboxes = this.element.querySelectorAll('tbody input[type="checkbox"]')
        const checkedBoxes = this.element.querySelectorAll('tbody input[type="checkbox"]:checked')

        selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length
    }

    updateSelectedIds() {
        const checkedBoxes = this.element.querySelectorAll('tbody input[type="checkbox"]:checked')
        const selectedIds = Array.from(checkedBoxes).map(cb => cb.dataset.tableRecordId)

        // Dispatch custom event with selected IDs
        this.element.dispatchEvent(new CustomEvent('table:selection-changed', {
            detail: { selectedIds },
            bubbles: true
        }))
    }

    disconnect() {
    }
}