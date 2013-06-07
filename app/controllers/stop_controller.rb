class StopController < ApplicationController
  def show
    @stop = Stop.get_stop_by_id({:id => params[:id] }).results.first
  end
  def bounds
    @stop = Stop.get_stop_by_bounds(params[:n], params[:s], params[:e], params[:w])
  end
end
