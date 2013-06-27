class StopController < ApplicationController
  def show
    @stop = Stop.get_stop_by_id({:id => params[:id] }).results.first
  end
  def bounds
    @stop = Stop.get_stop_by_bounds(params[:n], params[:s], params[:e], params[:w])
    @stop = @stop.map{ |i| {:lon=>i['location'][0],:lat=>i['location'][1],:id=>i['stop_id'].to_i, :name => i['stop_name'] } }

    respond_to do |format|
      format.json { render :json => @stop }
    end
  end
  def closest_trip
    
    # shape_array = []

    s = StopTime.get_closest_trip(params[:stop_id], params[:route] + '-62')

    unless s.blank?
      #shape = Shape.encode_to_polylines(s.first.shape_id.to_s)
      shape = ShapesGoogleEncoded.select('shape_id, encoded_polyline').find_by_shape_id(s.first.shape_id.to_s)
      # shape_array << {
      #   :encoded_shape => shape
      # }
    end

    respond_to do |format|
      format.json { render :json => shape, :status => :ok }
    end
  end
end
