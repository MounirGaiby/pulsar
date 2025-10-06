# frozen_string_literal: true

class UsersController < ApplicationController
  include FilterableIndex

  def index
    @users = filterable_index(
      User,
      base_scope: User.includes(:sessions),
      custom_filters: [
        { attribute: :email_address, type: :email },
        { attribute: :created_at, type: :datetime_range },
        { attribute: :updated_at, type: :datetime_range }
      ]
    )
  end
end
