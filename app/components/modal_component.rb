# frozen_string_literal: true

# ModalComponent - A customizable modal dialog component
#
# == Basic Usage:
#   <%= render ModalComponent.new(
#     id: "my-modal",
#     title: "Modal Title"
#   ) %>
#
# == Size Options:
#   size: :sm     # Small modal (max-w-sm)
#   size: :md     # Medium modal (max-w-2xl) - default
#   size: :lg     # Large modal (max-w-4xl)
#   size: :xl     # Extra large modal (max-w-6xl)
#   size: :full   # Full width modal (max-w-7xl)
#
# == Custom Width:
#   width: "w-96"           # Fixed width
#   width: "w-full max-w-3xl" # Responsive with max width
#
# == Custom Classes:
#   modal_class: "backdrop-blur-sm"           # Custom classes for dialog element
#   modal_box_class: "bg-base-200 rounded-2xl" # Custom classes for modal box
#   title_class: "text-2xl text-primary"       # Custom classes for title
#   content_class: "min-h-96"                  # Custom classes for content area
#
# == Style Modes:
#   modal_box_class_mode: :add      # Append to default classes (default)
#   modal_box_class_mode: :replace  # Replace all default classes
#
# == Complete Example:
#   <%= render ModalComponent.new(
#     id: "user-modal",
#     title: "User Details",
#     size: :lg,
#     closable: true,
#     backdrop_dismissable: true,
#     modal_box_class: "shadow-2xl border-2 border-primary",
#     title_class: "text-primary text-2xl",
#     content_class: "max-h-[80vh] overflow-y-auto"
#   ) %>

class ModalComponent < BaseComponent
  attr_reader :id, :title, :closable, :backdrop_dismissable, :turbo_frame_id,
              :size, :width, :modal_class, :modal_box_class, :title_class,
              :content_class, :modal_box_class_mode

  SIZES = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-7xl"
  }.freeze

  def initialize(
    id:,
    title: nil,
    closable: true,
    backdrop_dismissable: true,
    turbo_frame_id: nil,
    size: :md,
    width: nil,
    modal_class: nil,
    modal_box_class: nil,
    modal_box_class_mode: :add,
    title_class: nil,
    content_class: nil,
    **options
  )
    @id = id
    @title = title
    @closable = closable
    @backdrop_dismissable = backdrop_dismissable
    @turbo_frame_id = turbo_frame_id || "#{id}-content"
    @size = size
    @width = width
    @modal_class = modal_class
    @modal_box_class = modal_box_class
    @modal_box_class_mode = modal_box_class_mode
    @title_class = title_class
    @content_class = content_class
    @options = options
  end

  def modal_dialog_classes
    classes = [ "modal" ]
    classes << modal_class if modal_class.present?
    classes.join(" ")
  end

  def modal_box_classes
    default_classes = "modal-box w-11/12"
    size_class = width.presence || SIZES[@size] || SIZES[:md]

    if @modal_box_class_mode == :replace && @modal_box_class.present?
      @modal_box_class
    else
      classes = [ default_classes, size_class ]
      classes << @modal_box_class if @modal_box_class.present?
      classes.join(" ")
    end
  end

  def title_classes
    default_classes = "font-bold text-lg"

    if @title_class.present?
      [ default_classes, @title_class ].join(" ")
    else
      default_classes
    end
  end

  def content_classes
    default_classes = "py-4"

    if @content_class.present?
      [ default_classes, @content_class ].join(" ")
    else
      default_classes
    end
  end
end
