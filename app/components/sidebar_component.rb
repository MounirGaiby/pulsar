# frozen_string_literal: true

class SidebarComponent < ViewComponent::Base
  attr_reader :current_user

  def initialize(current_user:)
    @current_user = current_user
  end

  def links
    [
      { name: I18n.t("sidebar.links.dashboard"), path: "/dashboard" },
      { name: I18n.t("sidebar.links.profile"), path: "/profile" },
      { name: I18n.t("sidebar.links.logout"), path: logout_path, method: :delete }
    ]
  end
end
