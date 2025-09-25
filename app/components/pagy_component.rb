# frozen_string_literal: true

class PagyComponent < BaseComponent
  attr_reader :pagy, :form_id

  def initialize(pagy:, form_id: nil, **options)
    @pagy = pagy
    @form_id = form_id
    @options = options
  end

  def container_classes
    "flex items-center justify-between mt-4 px-2"
  end

  def info_classes
    "text-sm text-base-content/70"
  end

  def nav_classes
    "flex items-center gap-2"
  end

  def page_link_classes(page, current_page)
    base_classes = "btn btn-sm"
    if page == current_page
      "#{base_classes} btn-primary"
    else
      "#{base_classes} btn-ghost"
    end
  end

  def disabled_button_classes
    "btn btn-sm btn-ghost btn-disabled"
  end

  def gap_classes
    "px-2 text-base-content/50"
  end
end
