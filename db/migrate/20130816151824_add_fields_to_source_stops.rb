class AddFieldsToSourceStops < ActiveRecord::Migration
  def change
    add_column :source_stops, :external_stop_name, :string, null: false
    add_column :source_stops, :external_stop_desc, :string
    add_column :source_stops, :external_zone_id, :string, limit: 100
    add_column :source_stops, :external_stop_url, :string
    add_column :source_stops, :external_stop_street, :string
    add_column :source_stops, :external_stop_city, :string
    add_column :source_stops, :external_stop_region, :string
    add_column :source_stops, :external_stop_postcode, :string, limit: 50
    add_column :source_stops, :external_stop_country, :string, limit: 100
  end
end