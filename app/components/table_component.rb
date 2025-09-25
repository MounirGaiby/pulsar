# frozen_string_literal: true

class TableComponent < BaseComponent
  attr_reader :columns, :data, :pagy, :sort_column, :sort_direction, :empty_message, :table_id, :selectable, :selected_ids, :row_actions

  def initialize(
    columns:,
    data:,
    pagy: nil,
    sort_column: nil,
    sort_direction: "asc",
    empty_message: "No records found",
    table_id: nil,
    selectable: false,
    selected_ids: [],
    row_actions: [],
    **options
  )
    @columns = columns.map { |col| Column.new(col) }
    @data = data
    @pagy = pagy
    @sort_column = sort_column
    @sort_direction = sort_direction
    @empty_message = empty_message
    @table_id = table_id || "table-#{SecureRandom.hex(4)}"
    @selectable = selectable
    @selected_ids = Array(selected_ids)
    @row_actions = Array(row_actions)
    @options = options
  end

  def sortable?(column)
    column.sortable?
  end

  def sorted_by?(column, direction = nil)
    return false unless @sort_column&.to_sym == column.key

    direction.nil? ? true : @sort_direction == direction
  end

  def next_sort_direction(column)
    if sorted_by?(column, "asc")
      "desc"
    else
      "asc"
    end
  end

  def sort_icon(column)
    if sorted_by?(column)
      @sort_direction == "asc" ? "chevron-up" : "chevron-down"
    else
      "chevrons-up-down"
    end
  end

  def cell_value(record, column)
    value = column.value_from_record(record)
    column.format_value(value)
  end

  def record_selected?(record)
    return false unless selectable
    @selected_ids.include?(record.id)
  end

  def record_id(record)
    record.id
  end

  def all_selected?
    return false unless selectable
    return false if @data.empty?
    @data.all? { |record| @selected_ids.include?(record.id) }
  end

  def has_row_actions?
    @row_actions.any?
  end
  def responsive_classes
    "table table-auto w-full text-sm border-collapse"
  end

  def header_classes(column)
    base_classes = "px-4 py-3 text-left font-medium border-b border-base-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
    sortable_classes = sortable?(column) ? "hover:bg-base-200/50 cursor-pointer select-none" : ""
    sorted_classes = sorted_by?(column) ? "bg-primary/10 text-primary border-b-2 border-primary font-semibold" : "text-base-content/70"

    [ base_classes, sortable_classes, sorted_classes ].compact.join(" ")
  end

  def cell_classes(column)
    "px-4 py-3 border-b border-base-200/50 text-base-content hover:bg-base-50/50 transition-colors duration-150"
  end

  def empty_row_classes
    "px-4 py-8 text-center"
  end

  class Column
    attr_reader :key, :label, :sortable, :type, :formatter, :value_method

    def initialize(options = {})
      @key = options[:key] || options[:attribute]
      @label = options[:label] || @key.to_s.humanize
      @sortable = options.fetch(:sortable, true)
      @type = options[:type] || :string
      @formatter = options[:formatter]
      @value_method = options[:value_method] || @key
    end

    def sortable?
      @sortable
    end

    def value_from_record(record)
      if @value_method.is_a?(Proc)
        @value_method.call(record)
      elsif record.respond_to?(@value_method)
        record.send(@value_method)
      elsif record.is_a?(Hash)
        record[@value_method] || record[@value_method.to_s]
      else
        record
      end
    end

    def format_value(value)
      return "" if value.nil?

      if @formatter.is_a?(Proc)
        @formatter.call(value)
      elsif @formatter.is_a?(Symbol)
        send(@formatter, value)
      else
        case @type
        when :currency
          format_currency(value)
        when :date
          format_date(value)
        when :datetime
          format_datetime(value)
        when :boolean
          format_boolean(value)
        else
          value.to_s
        end
      end
    end

    private

    def format_currency(value)
      ActionController::Base.helpers.number_to_currency(value)
    end

    def format_date(value)
      value.strftime("%Y-%m-%d")
    end

    def format_datetime(value)
      value.strftime("%Y-%m-%d %H:%M")
    end

    def format_boolean(value)
      value ? "Yes" : "No"
    end
  end
end
