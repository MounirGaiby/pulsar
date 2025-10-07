# frozen_string_literal: true

class FormComponent < BaseComponent
  attr_reader :model, :url, :method

  def initialize(model:, url:, method: :post, **options)
    @model = model
    @url = url
    @method = method
    @options = options
  end

  def form_id
    model_name = @model.class.name.underscore
    @model.persisted? ? "edit_#{model_name}_#{@model.id}" : "new_#{model_name}"
  end

  def input_classes
    "input input-bordered w-full focus:input-primary transition-all duration-200"
  end

  def select_classes
    "select select-bordered w-full focus:select-primary transition-all duration-200"
  end

  def label_classes
    "label-text font-medium text-base-content/80"
  end

  def error_classes
    "text-error text-xs mt-1"
  end

  def form_section_classes
    "space-y-4"
  end

  def button_group_classes
    "flex items-center justify-end gap-3 mt-6"
  end

  def submit_button_classes
    "btn btn-primary min-w-[120px]"
  end

  def cancel_button_classes
    "btn btn-ghost"
  end
end
