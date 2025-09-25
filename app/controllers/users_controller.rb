# frozen_string_literal: true

class UsersController < ApplicationController
  def index
    # Build filters
    @filters = build_filters

    # Build Ransack query from filter parameters using FilterBuilder
    query_params = FilterBuilder.build_query_params(@filters, params)
    @q = User.ransack(query_params)
    users = @q.result

    # Apply sorting
    if params[:sort].present?
      direction = params[:direction] == "desc" ? :desc : :asc
      users = users.order(params[:sort] => direction)
    end

    # Apply pagination
    @pagy, @users = pagy(users, limit: (params[:limit] || 10).to_i)

    # Determine which filters are active based on params
    @active_filter_keys = FilterBuilder.determine_active_filter_keys(@filters, params)
  end

  private

  def build_filters
    FilterBuilder.build_filters_for_model(User, [
      # Custom filters can be added here
      { attribute: :email_address, type: :email },
      { attribute: :created_at, type: :datetime_range },
      { attribute: :updated_at, type: :datetime_range }
    ])
  end
end
