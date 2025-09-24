# frozen_string_literal: true

class SidebarComponent < BaseComponent
  attr_reader :current_user

  def initialize(current_user:, collapsed: false)
    @current_user = current_user
    @collapsed = collapsed
  end

  def links
    [
      { name: I18n.t("sidebar.links.dashboard"), path: root_path, icon: "home" }
    ]
  end
end
