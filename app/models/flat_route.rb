class FlatRoute < ActiveRecord::Base

  def self.get_trip_beginning_now(route_id)
    today = Date.today.strftime("%Y%m%d")
    timenow = Date.today.strftime("%H:%M:00")

    #TODO: Need to account for the direction
    select('trip_id')
    .where("start_date<='#{today}' AND '#{today}'<=end_date AND #{Date.today.strftime("%A").downcase} = true AND route_id='#{route_id}-68' AND arrival_time>='#{timenow}'")
    .order('arrival_time')
    .limit(1)
  end

  #TODO: Need to account for the direction
  def self.get_stop_list(route_id)
    today = Date.today.strftime("%Y%m%d")
    trip = get_trip_beginning_now(route_id).first()
    
    unless trip.nil?
      select('stop_id, stop_name, stop_sequence, stop_lat, stop_lon')
      .where({ 
        :trip_id => trip.trip_id,
        :route_id => "#{route_id}-68",
        Date.today.strftime("%A").downcase => 'true'
      })
      .order('stop_sequence')
    else
      []
    end
  end

end