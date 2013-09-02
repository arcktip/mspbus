namespace :omgtransit do

  # =========================================================================
  # Generic task to load gtfs data.  Should be called from helper methods.
  # =========================================================================

  task :load_gtfs_data, [:source_id, :path, :realtime_url, :replace_column] => :environment do |t, args|
    require 'csv'

    # Remove all previous rows.
    SourceStop.delete_all(["source_id = ?", args.source_id])
    
    # disable mass assignment restrictions
    SourceStop.send(:attr_protected)

    csv = CSV.parse(File.read(Rails.root.join(args.path, 'stops.txt')), headers: true) do |row|
      SourceStop.find_or_initialize_by_source_id_and_external_stop_id(args.source_id, row["#{args.replace_column}"]) do |stop|

        unless row["#{args.replace_column}"].nil?
          stop.external_lat       = row['stop_lat']
          stop.external_lon       = row['stop_lon']
          stop.external_stop_name = row['stop_name']
          stop.external_stop_desc = row['stop_desc']
          stop.external_zone_id   = row['zone_id']
          stop.external_stop_url  = args.realtime_url.gsub("{#{args.replace_column}}", row["#{args.replace_column}"])
          stop.external_stop_street   = row['stop_street']
          stop.external_stop_city     = row['stop_city']
          stop.external_stop_region   = row['stop_region']
          stop.external_stop_postcode = row['stop_postcode']
          stop.external_stop_country  = row['stop_country']
          stop.stop_type              = 1
          stop.save!
        end
      end
    end
  end

  task :load_msp_gtfs => :environment do
    Rake::Task['omgtransit:load_gtfs_data'].invoke(1, 'setup/msp_gtfs', "http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip", 'stop_id')
  end

  task :load_portland_gtfs => :environment do
    Rake::Task['omgtransit:load_gtfs_data'].invoke(4, 'setup/portland_gtfs', "http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true&format=json&parser=trimet", 'stop_id')
  end

  task :load_chicago_gtfs => :environment do
    # key - kPhyVbW2qnjqNfQSgvNXbxCsN
    Rake::Task['omgtransit:load_gtfs_data'].invoke(5, 'setup/chicago_gtfs', "http://www.ctabustracker.com/bustime/api/v1/getpredictions?key=kPhyVbW2qnjqNfQSgvNXbxCsN&stpid={stop_id}&format=xml&parser=clever", 'stop_id')
  end

  task :load_atlanta_gtfs => :environment do
    # GTFS URL - http://www.itsmarta.com/google_transit_feed/google_transit.zip
    Rake::Task['omgtransit:load_gtfs_data'].invoke(6, 'setup/atlanta_gtfs', "", 'stop_id')
  end

  task :load_washington_dc_gtfs => :environment do
    # GTFS URL - http://www.wmata.com/rider_tools/developer_resources.cfm
    Rake::Task['omgtransit:load_gtfs_data'].invoke(7, 'setup/washington_dc_gtfs', "http://api.wmata.com/NextBusService.svc/json/jPredictions?StopID={stop_code}&api_key=qbvfs2bv6ad55mjshrw8pjes&callback=?&format=json&parser=wmata", 'stop_code')
  end

  # ================================================================
  # Reindexes stops from master stops into the stops table.
  # ================================================================

  task :reset_stops => :environment do
    puts "Deleting Stops"
    ActiveRecord::Base.connection.execute("DELETE FROM stops")
    puts "Re-inserting Stops"
    ActiveRecord::Base.connection.execute("INSERT INTO stops
      (stop_code, stop_name, stop_desc, stop_lat, stop_lon, zone_id, stop_street, stop_city, stop_region, stop_postcode, stop_country)
      SELECT
      external_stop_id, external_stop_name, external_stop_desc,external_lat, external_lon, external_zone_id, 
      external_stop_street, external_stop_city, external_stop_region, external_stop_postcode, external_stop_country
      FROM source_stops")
    puts "Populating source stops from stops"
    ActiveRecord::Base.connection.execute("UPDATE source_stops SET stop_id = (SELECT id FROM stops WHERE stop_code = external_stop_id AND stop_name = external_stop_name)")
  end
end
