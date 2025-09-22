# frozen_string_literal: true

class LoginFormComponent < ViewComponent::Base
  def initialize(url:)
    @url = url
  end
end
