# frozen_string_literal: true

RSpec.shared_context "authentication helpers" do
  def sign_in_as(user)
    Current.session = user.sessions.create!

    ActionDispatch::TestRequest.create.cookie_jar.tap do |cookie_jar|
      cookie_jar.signed[:session_id] = Current.session.id
      cookies[:session_id] = cookie_jar[:session_id]
    end
  end

  def sign_out
    Current.session&.destroy!
    cookies.delete(:session_id)
  end
end

RSpec.configure { |config| config.include_context "authentication helpers" }
