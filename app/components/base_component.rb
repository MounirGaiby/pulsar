class BaseComponent < ViewComponent::Base
  def icon(name, library: "heroicons", **options)
    helpers.icon(name, library: library, **options)
  end
end
