require 'composite_primary_keys'
class SourceStop < ActiveRecord::Base
  self.primary_keys = :source_id, :external_stop_id
  attr_accessible :source_id, :stop_id, :external_stop_id, :external_stop_url, :external_lat, :external_lon, :external_stop_name, :stop_type

  belongs_to :stop, :foreign_key => :external_stop_id
end
