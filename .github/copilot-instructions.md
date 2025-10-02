# Pulsar - AI Coding Agent Instructions

## Architecture Overview

This is a **Rails 8** application using a modern component-based architecture with ViewComponent, Hotwire (Turbo + Stimulus), TailwindCSS 4, and DaisyUI. Key architectural decisions:

- **Components over partials**: All UI components in `app/components/` inherit from `BaseComponent` (extends `ViewComponent::Base`)
- **Custom authentication**: Session-based auth via `Authentication` concern (not Devise). Uses `Current` (ActiveSupport::CurrentAttributes) for request-scoped state
- **Hotwire-first**: Turbo Frames/Streams + Stimulus controllers for interactivity, with TurboPower for extended stream actions
- **Rails 8 Solid gems**: SQLite with Solid Queue, Solid Cache, and Solid Cable for jobs/cache/ActionCable

## Component Development

### Creating Components
Components follow ViewComponent conventions with paired Ruby + ERB files:
```ruby
# app/components/my_component.rb
class MyComponent < BaseComponent
  def initialize(title:, **options)
    @title = title
  end
end

# app/components/my_component.html.erb
<div><%= @title %></div>
```

`BaseComponent` provides helper delegations: `icon()`, `turbo_frame_tag()`, `link_to()`, `content_tag()`, `tag()`.

### Complex Components
See `DataTableComponent` and `FilterComponent` for patterns with:
- Server-side rendering + client-side Stimulus controllers
- I18n integration via `t()` calls in views
- Responsive design with priority classes (`:high`, `:normal`, `:low`)

## Authentication & Authorization

### Authentication Pattern
- **Controller concern**: `app/controllers/concerns/authentication.rb` included in `ApplicationController`
- **Session storage**: `Session` model tracks `user_agent` and `ip_address`, stores signed `session_id` in cookies
- **Current context**: Access via `Current.user` or `current_user` helper
- **Skip auth**: Use `allow_unauthenticated_access` class method in controllers (e.g., `SessionsController`)

Example from `app/controllers/concerns/authentication.rb`:
```ruby
def start_new_session_for(user)
  user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
    Current.session = session
    cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
  end
end
```

### Authorization
- Uses **Pundit** with policies in `app/policies/`
- Include `Pundit::Authorization` in `ApplicationController`

## Filtering & Data Tables

### FilterBuilder Service
Auto-generates filters from model attributes/associations:
```ruby
# app/controllers/users_controller.rb
def build_filters
  FilterBuilder.build_filters_for_model(User, [
    { attribute: :email_address, type: :email },
    { attribute: :created_at, type: :datetime_range }
  ])
end
```

- Uses **Ransack** for query building: `@q = User.ransack(query_params)`
- **Pagy** for pagination: `@pagy, @users = pagy(users, limit: 10)`
- Active filters tracked via `FilterBuilder.determine_active_filter_keys`

### DataTableComponent Usage
In views (see `app/views/users/index.html.erb`):
```erb
<%= render DataTableComponent.new(
  title: t('users.index.title'),
  filters: @filters,
  active_filter_keys: @active_filter_keys,
  columns: [
    { key: :email_address, label: t('users.columns.email'), sortable: true, priority: :high }
  ],
  data: @users,
  pagy: @pagy,
  row_actions: [{ label: "View", icon: "eye", url: ->(user) { user_path(user) }, type: :link }]
) %>
```

## I18n & RTL Support

- **Route scoping**: `scope "(:locale)", locale: /en|fr|ar/` in `config/routes.rb`
- **Locale handling**: `set_locale` before_action in `ApplicationController`, reads `params[:locale]`
- **RTL layout**: `authenticated.html.erb` sets `dir="rtl"` for Arabic via `I18n.locale.to_s == 'ar' ? 'rtl' : 'ltr'`
- **Dir controller**: Stimulus controller (`app/javascript/controllers/dir_controller.js`) manages directionality

## Frontend Architecture

### Stimulus Controllers
Auto-registered in `app/javascript/controllers/index.js` via `rails stimulus:manifest:update`:
```javascript
import { application } from "./application"
import ThemeController from "./theme_controller"
application.register("theme", ThemeController)
```

Key controllers:
- `filter_controller.js`: Dynamic filter UI with auto-submit, debouncing, and active filter badges
- `theme_controller.js`: Dark/light mode with localStorage + cookie persistence
- `table_controller.js`: Row selection, sorting
- `sidebar_controller.js`: Collapsible sidebar state

### Build Process
- **esbuild**: Bundles JS from `app/javascript/*.js` → `app/assets/builds/`
- **Tailwind CSS 4**: Builds from `app/assets/tailwind/application.css` → `app/assets/builds/application.css`
- **Propshaft**: Asset pipeline (not Sprockets)

### Icons
Uses **rails_icons** gem (configured in `config/initializers/rails_icons.rb`) with Heroicons as default:
```ruby
icon("user", library: "heroicons") # In components via BaseComponent#icon
```

## Development Workflow

### Running the App
```bash
bin/dev  # Starts Foreman with Procfile.dev (rails server + CSS/JS watch modes)
```

Procfile.dev runs:
- `web`: Rails server (port 3000)
- `css`: `yarn build:css --watch`
- `js`: `yarn build-dev --watch`

### Testing
Uses **RSpec** with ViewComponent test helpers:
```bash
bundle exec rspec                     # Run all specs
bundle exec rspec spec/components/    # Component specs only
```

Test types in `spec/`: `components/`, `controllers/`, `models/`, `requests/`, `services/`

### Ruby Version
Managed by **mise** (`mise.toml`): Ruby 3.4.6

### Database
SQLite (`storage/development.sqlite3`). Migrations in `db/migrate/`.

### Code Quality
- **Rubocop**: `bundle exec rubocop` (Rails Omakase config)
- **Brakeman**: `bundle exec brakeman` (security scanning)
- **Bullet**: N+1 query detection (logs to `log/bullet.log` in development)

## Models & Auditing

- **Audited gem**: Track changes with `audited` macro in models (see `User` model)
- **Goldiloader**: Automatic eager loading to prevent N+1s
- **Ransack**: Models must define `ransackable_attributes` and `ransackable_associations` for filtering

Example from `app/models/user.rb`:
```ruby
class User < ApplicationRecord
  audited
  has_secure_password
  
  def self.ransackable_attributes(auth_object = nil)
    %w[id email_address created_at updated_at]
  end
end
```

## Layouts

- **Authenticated layout**: `app/views/layouts/authenticated.html.erb` (default in `ApplicationController`)
  - Renders `SidebarComponent`, `TopbarComponent`, `FlashComponent`
  - Includes theme/dir data attributes for Stimulus
- **Sessions use application layout** (typically for login/logout)

## Common Patterns

### Service Objects
Place in `app/services/` (e.g., `FilterBuilder`). No base class convention observed.

### Controller Patterns
```ruby
class UsersController < ApplicationController
  include Pagy::Backend  # For pagination
  
  def index
    @filters = build_filters
    query_params = FilterBuilder.build_query_params(@filters, params)
    @q = User.ransack(query_params)
    users = @q.result
    @pagy, @users = pagy(users, limit: params[:limit] || 10)
  end
end
```

### Flash Messages
Rendered via `FlashComponent` in authenticated layout. Works with Turbo Streams.

## Key Dependencies
- Rails 8.0.2+
- ViewComponent
- Hotwire (Turbo Rails, Stimulus)
- TurboPower
- Ransack, Pagy, Pundit
- Audited, Goldiloader
- TailwindCSS 4, DaisyUI
- rails_icons (Heroicons)
- RSpec, Capybara, Selenium

## What to Avoid
- Don't use partials for new UI components—create ViewComponents instead, unless it's a very simple static snippet or email template
- Don't use Devise conventions—this app has custom authentication
- Don't skip `ransackable_attributes`/`ransackable_associations` on models used with Ransack
