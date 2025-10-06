# frozen_string_literal: true

module FilterableIndex
  extend ActiveSupport::Concern

  included do
    include Pagy::Backend
  end

  private

  def filterable_index(model_class, custom_filters: [], base_scope: nil, default_limit: 10, default_sort: nil)
    # Build filters
    @filters = FilterBuilder.build_filters_for_model(model_class, custom_filters)

    # Build Ransack query from filter parameters using FilterBuilder
    query_params = FilterBuilder.build_query_params(@filters, params)
    scope = base_scope || model_class.all
    @q = scope.ransack(query_params)
    records = @q.result

    # Apply sorting
    if params[:sort].present?
      direction = params[:direction] == "desc" ? :desc : :asc
      records = records.order(params[:sort] => direction)
    elsif default_sort.present?
      records = records.order(default_sort)
    end

    # Apply pagination
    pagy_limit = (params[:limit] || default_limit).to_i
    @pagy, paginated_records = pagy(records, limit: pagy_limit)

    # Determine which filters are active based on params
    @active_filter_keys = FilterBuilder.determine_active_filter_keys(@filters, params)

    paginated_records
  end
end
