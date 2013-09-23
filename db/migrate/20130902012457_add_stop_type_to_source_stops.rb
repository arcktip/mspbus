class AddStopTypeToSourceStops < ActiveRecord::Migration
  def change
    add_column :source_stops, :stop_type, :integer
  end
end
