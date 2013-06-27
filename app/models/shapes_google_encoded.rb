class ShapesGoogleEncoded < ActiveRecord::Base
  self.table_name = 'shapes_google_encoded'
  self.primary_key = 'shape_id'

  attr_accessible :encoded_polyline
end