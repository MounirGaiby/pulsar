class BaseComponent < ViewComponent::Base
  def icon(name, library: "heroicons", **options)
    helpers.icon(name, library: library, **options)
  end

  # Delegate common view helper methods to the helpers proxy so components
  # can call them directly (e.g., turbo_frame_tag in templates rendered by components).
  def turbo_frame_tag(*args, &block)
    helpers.turbo_frame_tag(*args, &block)
  end

  def content_tag(*args, &block)
    helpers.content_tag(*args, &block)
  end

  def link_to(*args, &block)
    helpers.link_to(*args, &block)
  end

  def tag(*args, &block)
    helpers.tag(*args, &block)
  end

  def simple_form(*args, &block)
    helpers.simple_form(*args, &block)
  end
end
