class SourceStop < ActiveRecord::Base
  attr_accessible :source_id, :stop_id, :external_stop_id, :external_stop_url, :external_lat, :external_lon
end