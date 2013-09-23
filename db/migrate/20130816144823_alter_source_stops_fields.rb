class AlterSourceStopsFields < ActiveRecord::Migration
  def change
    add_column :source_stops, :external_lat, :decimal, { precision: 9, scale: 6 }
    add_column :source_stops, :external_lon, :decimal, { precision: 9, scale: 6 }
  end
end