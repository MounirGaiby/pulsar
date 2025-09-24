import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="sidebar"
export default class extends Controller {
  static targets = ["menu", "icon", "link"]

  connect() {
    console.log("Sidebar controller connected")

    document.addEventListener("sidebar:toggle", (e) => {
      this.toggle(e)
    })
  }

  toggle(event) {
    console.debug("Toggling sidebar")
    const isCollapsed = this.menuTarget.classList.contains("sidebar-collapsed");
    if (event.detail.element.querySelector("[data-sidebar-target='collapse-icon']")) {
      const icon = event.detail.element.querySelector("[data-sidebar-target='collapse-icon']");
      this.update_icon(icon, isCollapsed)
    }
    this.menuTarget.classList.toggle("sidebar-collapsed");
    this.menuTarget.querySelector("#sidebar-logo img").classList.toggle("hidden")
    this.linkTargets.forEach((link) => {
      link.classList.toggle("hidden")
    });
  }

  update_icon(icon, isCollapsed) {
    // Ensure the icon has the base transition class
    icon.classList.add('collapse-icon');

    // Toggle rotation classes based on sidebar state
    if (isCollapsed) {
      icon.classList.add('collapse-icon-collapsed');
      icon.classList.remove('collapse-icon-expanded');
    } else {
      icon.classList.add('collapse-icon-expanded');
      icon.classList.remove('collapse-icon-collapsed');
    }
  }
}

