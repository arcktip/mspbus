namespace :mspbus do
  task :load_msp_metro_transit_stops => :environment do
    require 'csv'
    SourceStop.delete_all
    
    # disable mass assignment restrictions
    SourceStop.send(:attr_protected)
    #SourceStop.attr_accessible :source_id, :stop_id, :external_stop_id, :external_lat, :external_lon

    csv = CSV.parse(File.read(Rails.root.join('setup/msp_gtfs', 'stops.txt')), headers: true) do |row|
      # Stop.create!(row.to_hash)
      #raise row.to_yaml

      SourceStop.find_or_initialize_by_source_id_and_external_stop_id(1, row['stop_id']) do |stop|
        #raise row['stop_lat'].to_f.to_yaml
        # stop.update_attributes(

        # )
        stop.external_lat = row['stop_lat']
        stop.external_lon = row['stop_lon']
        stop.external_stop_name = row['stop_name']
        stop.external_stop_desc = row['stop_desc']
        stop.external_zone_id = row['zone_id']
        stop.external_stop_url = "http://svc.metrotransit.org/NexTrip/#{row['stop_id']}?callback=?&format=json&parser=nextrip"
        stop.external_stop_street = row['stop_street']
        stop.external_stop_city = row['stop_city']
        stop.external_stop_region = row['stop_region']
        stop.external_stop_postcode = row['stop_postcode']
        stop.external_stop_country = row['stop_country']
        stop.save!
      end

      # SourceStop.create_or_create_by_source_id_and_external_stop_id!({
      #   source_id: 1, # msp_gtfs
      #   external_stop_id: row[0],
      #   external_lat: row[3],
      #   external_lon: row[4],
      #   external_stop_name: row[1],
      #   external_stop_desc: row[2],
      #   external_zone_id: row[10],
      #   external_stop_url: row[11],
      #   external_stop_street: row[5],
      #   external_stop_city: row[6],
      #   external_stop_region: row[7],
      #   external_stop_postcode: row[8], 
      #   external_stop_country: row[9]
      # })

  # stop_id,
  # stop_name,
  # stop_desc,
  # stop_lat,
  # stop_lon,
  # stop_street,
  # stop_city,
  # stop_region,
  # stop_postcode,
  # stop_country,
  # zone_id,
  # stop_url
    end
  end

  task :reset_stops => :environment do
    puts "Deleting Stops"
    ActiveRecord::Base.connection.execute("delete FROM STOPS")
    puts "Re-inserting Stops"
    ActiveRecord::Base.connection.execute("insert into stops
      (stop_code, stop_name, stop_desc, stop_lat, stop_lon, zone_id, stop_street, stop_city, stop_region, stop_postcode, stop_country)
      SELECT
      external_stop_id, external_stop_name, external_stop_desc,external_lat, external_lon, external_zone_id, 
      external_stop_street, external_stop_city, external_stop_region, external_stop_postcode, external_stop_country
      FROM source_stops")
    puts "Populating source stops from stops"
    ActiveRecord::Base.connection.execute("update source_stops set stop_id = (SELECT ID FROM STOPS WHERE STOP_CODE = EXTERNAL_STOP_ID and stop_name = external_stop_name)")
  end
end
