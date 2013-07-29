class StopTime < ActiveRecord::Base

  self.table_name = 'flat_routes'

  def self.get_closest_trip(stop_id, route_id)
    today = Date.today.strftime("%Y%m%d")
    timenow = Time.new.strftime("%H:%M:00")

    #TODO: Need to account for the direction
    select('trip_id')
    .where("('#{today}' BETWEEN start_date AND end_date) AND #{Date.today.strftime("%A").downcase} = '1' AND route_id='#{route_id}-62' AND stop_id='#{stop_id}' AND arrival_time>='#{timenow}'")
    .order('arrival_time')
    .limit(1)
  end

  #TODO: Need to account for the direction
  def self.get_stop_neighbours(stop_id, route_id)
    trip_id=get_closest_trip(stop_id, route_id).first().trip_id
    puts trip_id

    select('stop_id, stop_name, stop_sequence, stop_lat, stop_lon')
    .where("trip_id='#{trip_id}'")
    .order('stop_sequence')
  end

  def shape_id
    raise "Missing attribute" unless has_attribute?(:shape_id)
    read_attribute(:shape_id).to_i # or instantiate a BigDecimal
  end

end
