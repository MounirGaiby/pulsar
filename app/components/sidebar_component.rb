# frozen_string_literal: true

class SidebarComponent < ViewComponent::Base
  attr_reader :current_user

  def initialize(current_user:)
    @current_user = current_user
  end

  def links
    [
      { name: I18n.t("sidebar.links.dashboard"), path: root_path }
    ]
  end
end
