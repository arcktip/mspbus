namespace :mspbus do

  # =========================================================================
  # Generic task to load gtfs data.  Should be called from helper methods.
  # =========================================================================

  task :load_gtfs_data, [:source_id, :path, :realtime_url] => :environment do |t, args|
    require 'csv'

    # Remove all previous rows.
    SourceStop.delete_all(["source_id = ?", args.source_id])
    
    # disable mass assignment restrictions
    SourceStop.send(:attr_protected)

    csv = CSV.parse(File.read(Rails.root.join(args.path, 'stops.txt')), headers: true) do |row|
      SourceStop.find_or_initialize_by_source_id_and_external_stop_id(args.source_id, row['stop_id']) do |stop|
        stop.external_lat = row['stop_lat']
        stop.external_lon = row['stop_lon']
        stop.external_stop_name = row['stop_name']
        stop.external_stop_desc = row['stop_desc']
        stop.external_zone_id = row['zone_id']
        stop.external_stop_url = args.realtime_url.gsub('{stop_id}', row['stop_id'])
        stop.external_stop_street = row['stop_street']
        stop.external_stop_city = row['stop_city']
        stop.external_stop_region = row['stop_region']
        stop.external_stop_postcode = row['stop_postcode']
        stop.external_stop_country = row['stop_country']
        stop.save!
      end
    end
  end

  task :load_msp_gtfs => :environment do
    Rake::Task['mspbus:load_gtfs_data'].invoke(1, 'setup/msp_gtfs', "http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip")
  end

  task :load_portland_gtfs => :environment do
    Rake::Task['mspbus:load_gtfs_data'].invoke(4, 'setup/portland_gtfs', "http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true&format=json&parser=trimet")
  end

  task :load_chicago_gtfs => :environment do
    Rake::Task['mspbus:load_gtfs_data'].invoke(5, 'setup/chicago_gtfs', "")
  end

  # ================================================================
  # Reindexes stops from master stops into the stops table.
  # ================================================================

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
