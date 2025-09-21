---
applyTo: '**'
---
# Copilot Instructions for AI Agents

## Project Overview
- This is a modern Rails 8 application with built-in authentication (no Devise). Key models: `User`, `Session`, and `Current` (see `app/models/`).
- UI is component-driven using ViewComponent (`app/components/`). Styling is managed with Tailwind CSS, with custom utility classes defined in `app/assets/tailwind/application.css` and config in `tailwind.config.js`.
- The layout is minimal, professional, and consistent (Apple-like). Sidebar navigation is toggled via a Stimulus controller (`app/javascript/controllers/sidebar_controller.js`).


## Key Patterns & Conventions
- **Authentication:**
  - Uses Rails 8's built-in authentication generator. `Current.user` is the canonical way to access the logged-in user. `current_user` is exposed as a helper in `ApplicationController` for compatibility.
  - Use `allow_unauthenticated_access` in controllers to whitelist actions (e.g., login, password reset) that do not require authentication.
- **Styling & Forms:**
  - Do not repeat Tailwind classes inline. Use utility classes (e.g., `.btn-primary`, `.card-container`, `.alert`) defined in `application.css`.
  - For new UI, always add reusable classes to `application.css` and reference them in components/partials. Never hardcode styles or duplicate logic.
  - Use `simple_form` for all forms to ensure consistency and future extensibility.
- **Components & DRY:**
  - All major UI is implemented as ViewComponents in `app/components/`. Pass only the minimal required data to components.
  - Always think about future maintainability, DRY, and reusability. Extract shared logic and UI into helpers or components.
  - Example: `render SidebarComponent.new(current_user: current_user)`
- **Icons:**
  - Only use the `rails_icons` gem for icons. Supported libraries (installed): `lucide`, `heroicons`.
  - Usage: `<%= icon "check", library: "lucide", class: "text-gray-500" %>` or `<%= icon "arrow-right", library: "heroicons", variant: "solid" %>`
  - See https://github.com/Rails-Designer/rails_icons for full syntax and options.
- **Sidebar:**
  - Sidebar is toggled with a button and animated using Tailwind transitions. See `sidebar_controller.js` and related classes in `application.css`.
- **Testing:**
  - RSpec is used for tests (`spec/`). Use `bin/rails spec` to run the suite.
- **Build & Assets:**
  - Tailwind is imported in `app/assets/tailwind/application.css`. Custom classes use `@apply` (ensure PostCSS is set up for this).
  - JS is bundled with esbuild (see `package.json` scripts).

## Developer Workflows
- **Start app:** `bin/dev` (uses Procfile.dev for multi-process dev)
- **Run tests:** `bin/rails spec`
- **Build JS:** `yarn build` or `yarn build-dev`
- **Migrations:** `bin/rails db:migrate`

## Integration Points
- Stimulus controllers in `app/javascript/controllers/` for interactivity.
- Mailers for password reset (`app/mailers/passwords_mailer.rb`).

## Examples
- To add a new button style, define `.btn-xyz` in `application.css` and use it in your component.
- To add a new sidebar link, update the `links` array in `SidebarComponent`.

## References
- `app/components/` — UI components
- `app/assets/tailwind/application.css` — custom utility classes
- `tailwind.config.js` — Tailwind theme/config
- `app/javascript/controllers/` — Stimulus controllers
- `app/models/current.rb` — current user/session logic
- `app/controllers/application_controller.rb` — authentication helpers

---
If any conventions or workflows are unclear, please ask for clarification or check the referenced files for examples.
