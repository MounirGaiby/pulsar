# frozen_string_literal: true

class DataTableComponent < BaseComponent
  attr_reader :filters, :columns, :data, :pagy, :sort_column, :sort_direction, :current_filters, :action_buttons, :title, :active_filter_keys, :selectable, :selected_ids, :row_actions

  def initialize(
    title: nil,
    filters: [],
    columns:,
    data:,
    pagy: nil,
    sort_column: nil,
    sort_direction: "asc",
    current_filters: {},
    action_buttons: [],
    active_filter_keys: [],
    selectable: false,
    selected_ids: [],
    row_actions: [],
    **options
  )
    @title = title
    @filters = filters
    @columns = columns
    @data = data
    @pagy = pagy
    @sort_column = sort_column
    @sort_direction = sort_direction
    @current_filters = current_filters || {}
    @action_buttons = action_buttons
    @active_filter_keys = active_filter_keys || []
    @selectable = selectable
    @selected_ids = Array(selected_ids)
    @row_actions = Array(row_actions)
    @options = options
  end

  def container_classes
    "space-y-6"
  end

  def title_classes
    "text-2xl font-bold text-base-content"
  end

  def has_filters?
    @filters.any?
  end

  def has_action_buttons?
    @action_buttons.any?
  end

  def action_button_classes(button)
    base_classes = "btn"
    variant_classes = button[:variant] ? "btn-#{button[:variant]}" : "btn-primary"
    size_classes = button[:size] ? "btn-#{button[:size]}" : ""

    [ base_classes, variant_classes, size_classes ].compact.join(" ")
  end

  def filter_component
    @filter_component ||= FilterComponent.new(
      filters: @filters,
      current_filters: @current_filters,
      active_filter_keys: @active_filter_keys
    )
  end

  def pagy_component
    @pagy_component ||= PagyComponent.new(
      pagy: @pagy,
      form_id: filter_component.form_id
    )
  end
end
