class StopTime < ActiveRecord::Base

  def self.get_closest_trip(stop_id, route_id)

    service_ids = Calendar.get_service_ids
    
    #sql = "trips.service_id in (?) and stop_times.stop_id = ? and trips.route_id = ? and arrival_time::time >= CURRENT_TIME"
    sql = "trips.service_id in (#{service_ids.collect{ |c| "?" }.join(',') }) and stop_times.stop_id = ? and trips.route_id = ? and arrival_time >= CURRENT_TIME::varchar"
  
    select('trips.shape_id as shape_id, stop_times.trip_id')
    .joins('inner join trips on trips.trip_id = stop_times.trip_id')
    .where([sql, *service_ids.collect{ |c| "#{c.service_id}" }, stop_id, route_id])
    .order('stop_times.arrival_time, trips.service_id')
    .limit(1)
  end

  def shape_id
    raise "Missing attribute" unless has_attribute?(:shape_id)
    read_attribute(:shape_id).to_i # or instantiate a BigDecimal
  end

end