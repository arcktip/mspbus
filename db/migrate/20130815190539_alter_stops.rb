class AlterStops < ActiveRecord::Migration
  def up
    execute("CREATE EXTENSION postgis;") # enable postgis so we can add a geometry data point
    #add_column :stops, :geo_point, :geometry
    #execute "update stops set GEO_POINT = ST_GeomFromText('POINT(' || stop_lon || '' || stop_lat || ')')"
    
    # add_column :stops, :agency_id, :integer
    # add_index  :stops, :agency_id
    # execute "update stops set agency_id = 0;"
  end

  def down
    #remove_column :stops, :geo_point
    # remove_index  :stops, :agency_id
    # remove_column :stops, :agency_id
  end
end