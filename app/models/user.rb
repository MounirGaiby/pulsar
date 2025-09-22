class User < ApplicationRecord
  audited

  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  # Authenticate a user with the provided params (from permittted session params).
  # Returns the user on success, or a symbol describing the failure on failure.
  # Possible return values:
  # - User instance: successful authentication
  # - :user_not_found: no user with the provided email exists
  # - :invalid_password: email found but password doesn't match
  def self.authenticate_by(params)
    email = params[:email_address].to_s.strip.downcase
    password = params[:password].to_s

    user = find_by(email_address: email)
    return :user_not_found unless user

    return user if user.authenticate(password)

    :invalid_password
  end
end
