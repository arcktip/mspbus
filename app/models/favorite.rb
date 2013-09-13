class Favorite < ActiveRecord::Base
  attr_accessible :stop_id, :user_id

  belongs_to :stop
  has_many :source_stops, through: :stop
end
