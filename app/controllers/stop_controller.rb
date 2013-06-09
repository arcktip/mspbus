class StopController < ApplicationController
  def show
    @stop = Stop.get_stop_by_id({:id => params[:id] }).results.first
  end
  def bounds
    @stop = Stop.get_stop_by_bounds(params[:n], params[:s], params[:e], params[:w])
    @stop = @stop.map{ |i| {:lon=>i['location'][0],:lat=>i['location'][1],:id=>i['stop_id'].to_i} }

    respond_to do |format|
      format.json { render :json => @stop }
    end
  end
end
