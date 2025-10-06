import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="filter"
export default class extends Controller {
    static targets = ["form", "activeFilters", "inputsContainer", "searchInput", "filterItem", "sortField", "directionField", "pageField", "sortLabel", "sortItem", "sortSearchInput"]
    static values = {
        debounce: { type: Number, default: 300 }
    }

    connect() {
        this.setupAutoSubmit()

        // Build initial map (will be refreshed when dropdown opens)
        this.rebuildFilterItemsMap()

        // Attach a delegated click listener on dropdown triggers so we rebuild the map
        // when the Add Filter dropdown is opened. We attach observers lazily.
        this._dropdownOpenHandler = this.onDropdownOpen.bind(this)
        const triggers = this.element.querySelectorAll('.dropdown > [role="button"], .dropdown > [tabindex]')
        this._dropdownTriggers = Array.from(triggers)
        this._dropdownTriggers.forEach(t => t.addEventListener('click', this._dropdownOpenHandler))

        this.disableActiveDropdownItems()

        // Listen for table sort events to sync hidden fields
        this.syncSortFromTable = this.handleTableSort.bind(this)
        document.addEventListener('table:sort-changed', this.syncSortFromTable)
    }

    rebuildFilterItemsMap() {
        try {
            this.filterItemsMap = new Map()
                ; (this.filterItemTargets || []).forEach(item => {
                    const btn = item.querySelector('button[data-filter-key]')
                    if (btn && btn.dataset && btn.dataset.filterKey) {
                        this.filterItemsMap.set(btn.dataset.filterKey, item)
                    }
                })
        } catch (e) {
            this.filterItemsMap = new Map()
        }
    }

    onDropdownOpen(event) {
        // When dropdown opens, refresh the map and attach a mutation observer to the dropdown list
        try {
            this.rebuildFilterItemsMap()

            const list = event.currentTarget?.parentElement?.querySelector('.dropdown-content') || this.element.querySelector('.dropdown-content')
            if (list && !this._dropdownObserver) {
                this._dropdownObserver = new MutationObserver(() => this.rebuildFilterItemsMap())
                this._dropdownObserver.observe(list, { childList: true, subtree: true, attributes: true })
            }
        } catch (e) {
            // ignore
        }
    }

    submit(event) {
        event?.preventDefault()

        // Clear debounce timeout if exists
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }

        // Submit immediately
        this.performSubmit()
    }

    performSubmit() {
        const form = this.element.tagName && this.element.tagName.toLowerCase() === 'form' ? this.element : this.element.querySelector('form')
        if (!form) return
        // Merge existing URL params (so sort/direction and other params are preserved)
        let newUrl
        try {
            const params = new URLSearchParams(window.location.search)
            const formData = new FormData(form)
            for (const [k, v] of formData.entries()) {
                if (v === null || v === undefined || v === '') {
                    params.delete(k)
                } else {
                    params.set(k, v)
                }
            }

            newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
            // Update history so back/refresh show the merged URL
            try { window.history.replaceState({}, '', newUrl) } catch (e) { }
        } catch (e) {
            // ignore and fall back to default form submission
        }

        // If Turbo is available, visit the merged URL targeting the form's turbo frame
        try {
            const candidate = form.dataset?.turboFrame || form.getAttribute('data-turbo-frame') || this.element.closest('turbo-frame')?.id
            if (newUrl && typeof Turbo !== 'undefined' && Turbo.visit) {
                if (candidate && document.getElementById(candidate)) {
                    Turbo.visit(newUrl, { frame: candidate })
                } else {
                    Turbo.visit(newUrl)
                }
                return
            }
        } catch (e) {
            // ignore and fall back
        }

        // Fallback: submit the form normally
        if (typeof form.requestSubmit === 'function') {
            form.requestSubmit()
        } else if (typeof form.submit === 'function') {
            form.submit()
        }
    }

    setupAutoSubmit() {
        const root = this.element.tagName && this.element.tagName.toLowerCase() === 'form' ? this.element : this.element
        const inputs = root.querySelectorAll('input, select')

        inputs.forEach(input => {
            // Skip submit buttons
            if (input.type === 'submit') return

            input.addEventListener('input', this.debouncedSubmit.bind(this))
            input.addEventListener('change', this.debouncedSubmit.bind(this))
        })
    }

    debouncedSubmit() {
        // Clear existing timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }

        // Reset to page 1 when filter values change
        if (this.hasPageFieldTarget) {
            this.pageFieldTarget.value = '1'
        }

        // Set new timeout
        this.debounceTimeout = setTimeout(() => {
            this.performSubmit()
        }, this.debounceValue)
    }

    // Allow direct invocation from data-action on inputs in templates
    debouncedSubmitFromElement(event) {
        this.debouncedSubmit()
    }

    clearAllFilters(event) {
        event.preventDefault()
        const form = this.element.tagName && this.element.tagName.toLowerCase() === 'form' ? this.element : this.element.querySelector('form')
        if (form) {
            // Clear all filter inputs and operators
            const inputs = form.querySelectorAll('input[name], select[name]')
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false
                } else {
                    input.value = ''
                }
            })

            // Submit with cleared filters
            // Remove all query params from URL and reload to fully reset state
            const base = window.location.pathname
            window.history.replaceState({}, '', base)
            // Use a full reload so server-side state (e.g., default ordering) is reset
            window.location.href = base
        }
    }

    addFilter(event) {
        // intentionally not logging to keep console clean in production
        event.preventDefault()
        const filterKey = event.currentTarget.dataset.filterKey
        const filterLabel = event.currentTarget.dataset.filterLabel || event.currentTarget.textContent.trim()

        // Close any open dropdowns
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.removeAttribute('open')
        })

        // Reveal client-side input block for this filter and focus first input
        const inputsContainer = this.inputsContainerTarget
        if (!inputsContainer) return

        const filterBlock = inputsContainer.querySelector(`[data-filter-key="${filterKey}"]`)
        if (filterBlock) {
            // Remove hidden class to show it
            filterBlock.classList.remove('hidden')
            const firstInput = filterBlock.querySelector('input, select, textarea')
            if (firstInput) firstInput.focus()

            // Add badge to active filters bar if not present
            const activeBar = this.activeFiltersTarget
            if (activeBar && !activeBar.querySelector(`[data-filter-key="${filterKey}"]`)) {
                // Clone the server-rendered template so we preserve i18n and ViewComponent markup
                const template = document.querySelector('[data-filter-template]')
                if (template && template.content) {
                    const clone = template.content.cloneNode(true)
                    // Find the badge element (root of the cloned fragment)
                    const badgeEl = clone.querySelector('[data-filter-key]')
                    if (badgeEl) {
                        // Set the filter key attribute for selection and remove action
                        badgeEl.dataset.filterKey = filterKey
                        badgeEl.setAttribute('data-filter-key', filterKey)

                        // Set the label and value text by targeting the first and second span

                        const spans = badgeEl.querySelectorAll('span')
                        const labelText = filterLabel
                        if (spans.length > 0) spans[0].textContent = labelText

                        // Read current value(s) from the revealed filter block to show in the badge
                        // Important: exclude operator selects (e.g., name ending with _operator) so the badge shows
                        // the entered value(s) instead of operator codes like 'cont' or 'eq'.
                        let valueText = ''
                        try {
                            const inputs = filterBlock.querySelectorAll('input, select, textarea')
                            const values = Array.from(inputs)
                                .filter(i => !(i.name && i.name.toString().endsWith('_operator')))
                                .map(i => i.value)
                                .filter(v => v && v.toString().trim() !== '')
                            valueText = values.join(' • ')
                        } catch (e) {
                            valueText = ''
                        }

                        if (spans.length > 1) spans[1].textContent = valueText

                        // Ensure the remove button has the correct data-filter-key
                        const removeBtn = badgeEl.querySelector('button[data-action~="filter#removeFilter"]')
                        if (removeBtn) {
                            removeBtn.dataset.filterKey = filterKey
                            removeBtn.setAttribute('data-filter-key', filterKey)
                        }
                    }

                    activeBar.appendChild(clone)
                    // Hide the dropdown item that corresponds to this filter
                    this.hideDropdownItem(filterKey)
                } else {
                    // Fallback to simple badge if template is missing
                    const badge = document.createElement('div')
                    badge.className = 'badge badge-primary gap-2 px-3 py-2'
                    badge.dataset.filterKey = filterKey
                    badge.innerHTML = `${filterKey} <button type="button" class="btn btn-ghost btn-xs btn-circle" data-action="filter#removeFilter" data-filter-key="${filterKey}">×</button>`
                    activeBar.appendChild(badge)
                    this.hideDropdownItem(filterKey)
                }
            }
        }
    }

    updateOperator(event) {
        // Operator changed; auto-submit handled via debounced listener
        this.debouncedSubmit()
    }

    removeFilter(event) {
        event.preventDefault()
        const filterKey = event.currentTarget.dataset.filterKey

        // Hide the filter block client-side
        const inputsContainer = this.inputsContainerTarget
        if (inputsContainer) {
            const filterBlock = inputsContainer.querySelector(`[data-filter-key="${filterKey}"]`)
            if (filterBlock) {
                // Clear input values inside
                const inputs = filterBlock.querySelectorAll('input, select, textarea')
                inputs.forEach(i => {
                    if (i.type === 'checkbox' || i.type === 'radio') {
                        i.checked = false
                    } else {
                        i.value = ''
                    }
                })
                filterBlock.classList.add('hidden')
            }
        }

        // Remove badge
        const badge = this.activeFiltersTarget?.querySelector(`[data-filter-key="${filterKey}"]`)
        if (badge) badge.remove()

        // Re-enable dropdown button for this filter
        this.showDropdownItem(filterKey)

        // Reset to page 1 when removing filters
        if (this.hasPageFieldTarget) {
            this.pageFieldTarget.value = '1'
        }

        // Submit to update the table
        this.submit()
    }

    disconnect() {
        // Clear any pending timeouts
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }
        // Remove observers and listeners
        if (this._dropdownObserver) {
            this._dropdownObserver.disconnect()
            this._dropdownObserver = null
        }
        if (this._dropdownTriggers) {
            this._dropdownTriggers.forEach(t => t.removeEventListener('click', this._dropdownOpenHandler))
        }
        // Remove table sort listener
        if (this.syncSortFromTable) {
            document.removeEventListener('table:sort-changed', this.syncSortFromTable)
        }
    }

    searchFilters(event) {
        const searchTerm = event.target.value.toLowerCase().trim()

        this.filterItemTargets.forEach(item => {
            // Skip items that were hidden due to active filters (li has data-hidden-by-filter)
            if (item.dataset?.hiddenByFilter === 'true' || item.getAttribute('data-hidden-by-filter') === 'true') {
                item.style.display = 'none'
                return
            }

            const label = item.dataset.filterLabel
            const matches = label.includes(searchTerm)
            item.style.display = matches ? '' : 'none'
        })
    }

    searchSortOptions(event) {
        const searchTerm = event.target.value.toLowerCase().trim()

        this.sortItemTargets.forEach(item => {
            const label = item.dataset.sortLabel
            const matches = label.includes(searchTerm)
            item.style.display = matches ? '' : 'none'
        })
    }

    setDropdownButtonDisabled(filterKey, disabled) {
        // Find any dropdown button with this filter-key and disable/enable it
        const btn = this.element.querySelector(`[data-filter-key="${filterKey}"]`)
        if (btn) btn.disabled = !!disabled
    }

    hideDropdownItem(filterKey) {
        // Hide the dropdown list item using the prebuilt map for reliability.
        // If the map doesn't contain the item (e.g. after a refresh or DOM change),
        // fall back to querying the live DOM so the item still gets hidden and
        // properly marked so search won't reveal it.
        const liFromMap = this.filterItemsMap?.get(filterKey)
        if (liFromMap) {
            liFromMap.dataset.hiddenByFilter = 'true'
            liFromMap.style.display = 'none'
            return
        }

        // Fallback: find button and its li parent live
        const btn = this.element.querySelector(`[data-filter-target="filterItem"] button[data-filter-key="${filterKey}"]`)
        if (btn) {
            const li = btn.closest('li')
            if (li) {
                li.dataset.hiddenByFilter = 'true'
                li.style.display = 'none'
            }
        }
    }

    showDropdownItem(filterKey) {
        // Try map first
        const liFromMap = this.filterItemsMap?.get(filterKey)
        if (liFromMap) {
            delete liFromMap.dataset.hiddenByFilter
            liFromMap.style.display = ''
            return
        }

        // Fallback: find button and its li parent live
        const btn = this.element.querySelector(`[data-filter-target="filterItem"] button[data-filter-key="${filterKey}"]`)
        if (btn) {
            const li = btn.closest('li')
            if (li) {
                delete li.dataset.hiddenByFilter
                li.style.display = ''
            }
        }
    }

    disableActiveDropdownItems() {
        // Disable buttons for filters that are currently active (present in activeFiltersTarget)
        try {
            const activeKeys = Array.from(this.activeFiltersTarget?.querySelectorAll('[data-filter-key]') || []).map(el => el.dataset.filterKey)
            activeKeys.forEach(k => this.hideDropdownItem(k))
        } catch (e) {
            // ignore
        }
    }

    applySort(event) {
        event.preventDefault()
        const button = event.currentTarget
        const column = button.dataset.sortColumn
        const direction = button.dataset.sortDirection
        const label = button.dataset.sortLabel

        // Close dropdown
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.removeAttribute('open')
        })

        // Update the UI immediately before submitting
        this.updateSortUI(column, direction, label)

        // Update hidden fields
        if (this.hasSortFieldTarget) {
            this.sortFieldTarget.value = column
        }
        if (this.hasDirectionFieldTarget) {
            this.directionFieldTarget.value = direction
        }
        
        // Reset to page 1 when sorting changes
        if (this.hasPageFieldTarget) {
            this.pageFieldTarget.value = '1'
        }

        // Submit form
        this.submit()
    }

    updateSortUI(column, direction, label) {
        // Update the dropdown button label (just the column name, no direction text)
        if (this.hasSortLabelTarget && label) {
            this.sortLabelTarget.textContent = label
        }

        // Update active states in the dropdown menu
        const form = this.element.tagName && this.element.tagName.toLowerCase() === 'form' ? this.element : this.element.querySelector('form')
        if (!form) return

        // Remove all active states and checkmarks
        const allSortButtons = form.querySelectorAll('[data-sort-column]')
        allSortButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-base-200')
            // Remove existing checkmarks
            const existingCheck = btn.querySelector('.sort-check')
            if (existingCheck) {
                existingCheck.remove()
            }
        })

        // Add active state to the selected button
        const selectedButton = form.querySelector(`[data-sort-column="${column}"][data-sort-direction="${direction}"]`)
        if (selectedButton) {
            selectedButton.classList.add('active', 'bg-base-200')
            
            // Add checkmark icon
            const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            checkIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            checkIcon.setAttribute('width', '16')
            checkIcon.setAttribute('height', '16')
            checkIcon.setAttribute('viewBox', '0 0 24 24')
            checkIcon.setAttribute('fill', 'none')
            checkIcon.setAttribute('stroke', 'currentColor')
            checkIcon.setAttribute('stroke-width', '2')
            checkIcon.setAttribute('stroke-linecap', 'round')
            checkIcon.setAttribute('stroke-linejoin', 'round')
            checkIcon.classList.add('w-4', 'h-4', 'ml-auto', 'sort-check')
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path.setAttribute('d', 'M20 6 9 17l-5-5')
            checkIcon.appendChild(path)
            
            selectedButton.appendChild(checkIcon)
        }
    }

    handleTableSort(event) {
        // Sync sort fields when table header is clicked
        const { column, direction } = event.detail || {}
        
        if (column && direction) {
            if (this.hasSortFieldTarget) {
                this.sortFieldTarget.value = column
            }
            if (this.hasDirectionFieldTarget) {
                this.directionFieldTarget.value = direction
            }
            // Reset to page 1 when table header sorting changes
            if (this.hasPageFieldTarget) {
                this.pageFieldTarget.value = '1'
            }
            
            // Update the UI to reflect the sort change
            // Find the label for this column from the sort buttons
            const form = this.element.tagName && this.element.tagName.toLowerCase() === 'form' ? this.element : this.element.querySelector('form')
            if (form) {
                const sortButton = form.querySelector(`[data-sort-column="${column}"]`)
                const label = sortButton?.dataset.sortLabel
                if (label) {
                    this.updateSortUI(column, direction, label)
                }
            }
        }
    }
}