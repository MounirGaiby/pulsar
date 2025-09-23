# frozen_string_literal: true

class DropdownComponent < BaseComponent
  renders_one :trigger
  renders_one :menu

  def initialize(id: nil, classes: nil, align: :right)
    @id = id || "dropdown-#{SecureRandom.hex(6)}"
    @classes = classes
    @align = align
  end

  def container_classes
    base = "dropdown-menu hidden absolute mt-2 w-56 shadow-card rounded p-2 z-50"
    alignment = @align == :left ? "dropdown-left" : "dropdown-right"
    [ base, alignment ].compact.join(" ")
  end
end
