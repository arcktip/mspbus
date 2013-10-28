class StopController < ApplicationController
  def show
    @stop = Stop.get_stop_by_id({ :id => params[:id], :source_id => params[:source_id] }).results.first
    @lat = @stop.location[1]
    @lon = @stop.location[0]
    puts @lat
  end

  def bounds
    @stop = Stop.get_stop_by_bounds(params[:n], params[:s], params[:e], params[:w])
    @stop = @stop.map{ |i| {:lon=>i['location'][0],:lat=>i['location'][1],:id=>i['id'].to_i, :name => i['stop_name'], :source_stops=>i['source_stops'] } }

    respond_to do |format|
      format.json { render :json => @stop }
    end
  end

  def get_stop_neighbours
    @neighbours=StopTime.get_stop_neighbours(params[:stop_id], params[:route_id])

    stop_index = @neighbours.index {|a| a.id==params[:stop_id]}

    #Get the 4 stops before and the 4 stops after this one
    @neighbours=@neighbours[ [stop_index-4,0].max .. [stop_index+4,@neighbours.length].min ]

    respond_to do |format|
      format.json { render :json=> @neighbours }
    end
  end

  def arrivals
    @arrivals=StopTime.arrivals(params[:stopid])

    puts :stopid
    puts "========================"
    puts @arrivals

    respond_to do |format|
      format.json { render :json=>@arrivals}
    end
  end

  def closest_trip
    
    # shape_array = []

    s = StopTime.get_closest_trip(params[:stop_id], params[:route])

    unless s.blank?
      #shape = Shape.encode_to_polylines(s.first.shape_id.to_s)
      shape = ShapesGoogleEncoded.select('shape_id, encoded_polyline').find_by_shape_id(s.first.shape_id.to_s)
      puts shape
      # shape_array << {
      #   :encoded_shape => shape
      # }
    end

    respond_to do |format|
      format.json { render :json => shape, :status => :ok }
    end
  end
end
