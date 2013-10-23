class Favorite < ActiveRecord::Base
  attr_accessible :stop_id, :user_id, :stop_source_id

  belongs_to :user
  belongs_to :stop, :foreign_key => [:stop_id, :stop_source_id]
  belongs_to :source, :foreign_key => :stop_source_id
end
