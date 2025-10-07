# frozen_string_literal: true

class ModalComponent < BaseComponent
  attr_reader :id, :title, :closable, :backdrop_dismissable, :turbo_frame_id

  def initialize(
    id:,
    title: nil,
    closable: true,
    backdrop_dismissable: true,
    turbo_frame_id: nil,
    **options
  )
    @id = id
    @title = title
    @closable = closable
    @backdrop_dismissable = backdrop_dismissable
    @turbo_frame_id = turbo_frame_id || "#{id}-content"
    @options = options
  end
end
