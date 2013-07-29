class Route < ActiveRecord::Base

  self.table_name = 'flat_routes'

  def self.get_stop_list(route_id)
    today = Date.today.strftime("%Y%m%d")
    select('stop_id, stop_name, stop_sequence, stop_lat, stop_lon')
    .where("start_date<='#{today}' AND '#{today}'<=end_date AND #{Date.today.strftime("%A").downcase} = '1' AND route_id='#{route_id}-62'")
    .order('stop_sequence')
  end


end
