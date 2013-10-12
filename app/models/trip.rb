class Trip < ActiveRecord::Base
  attr_accessible :block_id, :route_id, :service_id, :shape_id, :source_id, :trip_headsign, :trip_id, :wheelchair_accessible, :direction_id
end
