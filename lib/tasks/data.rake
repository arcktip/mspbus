namespace :omgtransit do

  # =========================================================================
  # Generic task to load gtfs data.  Should be called from helper methods.
  # =========================================================================

  task :load_gtfs_stops, [:source_id, :path, :realtime_url, :replace_column] => :environment do |t, args|
    require 'csv'

    # Remove all previous rows.
    Stop.delete_all(["source_id = ?", args.source_id])

    puts "Adding/Updating Stops"
    csv = CSV.parse(File.read(Rails.root.join(args.path, 'stops.txt')), headers: true) do |row|
      Stop.create!({
        id: [row['stop_id'], args.source_id],
        source_id: args.source_id,
        stop_code: row['stop_code'],
        stop_name: row['stop_name'],
        stop_desc: row['stop_desc'],
        stop_lat: row['stop_lat'],
        stop_lon: row['stop_lon'],
        zone_id: row['zone_id'],
        url: args.realtime_url.gsub("{#{args.replace_column}}", row["#{args.replace_column}"]),
        stop_type: 1
      })
    end

  end

  task :load_gtfs_stop_times, [:source_id, :path] => :environment do |t, args|
    require 'csv'

    puts "Prep file for import..."
    file_name = Rails.root.join(args.path, 'stop_times.txt')
    file_name_parsed = Rails.root.join(args.path, 'stop_times_parsed.txt')

    file = File.open(file_name, 'r')

    File.open(file_name_parsed,"w+") do |f|
      while !file.eof?
        f.puts file.readline.split(',')[0..4].join(',').prepend("#{args.source_id},")
      end
    end

    puts "Deleting Stop Times for source_id #{args.source_id}"
    ActiveRecord::Base.connection.execute("
      DELETE FROM stop_times WHERE source_id = #{args.source_id}
    ")

    puts "Inserting stop times for source_id #{args.source_id}"
    ActiveRecord::Base.connection.execute("
      COPY stop_times (source_id, trip_id, arrival_time, departure_time, stop_id, stop_sequence) 
      FROM '#{file_name_parsed}' DELIMITERS ',' CSV HEADER
    ")
  end

  task :load_gtfs_trips, [:source_id, :path] => :environment do |t, args|
    require 'csv'

    puts "Deleting trips for source_id #{args.source_id}"
    ActiveRecord::Base.connection.execute("
      DELETE FROM trips WHERE source_id = #{args.source_id}
    ")
    
    puts "Adding Trips for source_id = #{args.source_id}"
    csv = CSV.parse(File.read(Rails.root.join(args.path, 'trips.txt')), headers: true) do |row|
      Trip.create!({
        :source_id => args.source_id,
        :route_id  => row['route_id'],
        :service_id => row['service_id'],
        :trip_id => row['trip_id'],
        :trip_headsign => row['trip_headsign'],
        :block_id => row['block_id'],
        :shape_id => row['shape_id'],
        :wheelchair_accessible => row['wheelchair_accessible'],
        :direction_id => row['direction_id']
      })
    end
  end

  task :load_gtfs_routes, [:source_id, :path] => :environment do |t, args|
    require 'csv'

    puts "Deleting routes for source_id #{args.source_id}"
    ActiveRecord::Base.connection.execute("
      DELETE FROM routes WHERE source_id = #{args.source_id}
    ")
    
    puts "Adding routes for source_id = #{args.source_id}"
    csv = CSV.parse(File.read(Rails.root.join(args.path, 'routes.txt')), headers: true) do |row|
      Route.create!({
        :source_id => args.source_id,
        :route_id  => row['route_id'],
        :agency_id => row['agency_id'],
        :route_short_name => row['route_short_name'],
        :route_long_name => row['route_long_name'],
        :route_desc => row['route_desc'],
        :route_type => row['route_type'],
        :route_url => row['route_url'],
        :route_color => row['route_color'],
        :route_text_color => row['route_text_color']
      })
    end
  end

  task :load_gtfs_calendar, [:source_id, :path] => :environment do |t, args|
    require 'csv'

    puts "Deleting routes for source_id #{args.source_id}"
    ActiveRecord::Base.connection.execute("
      DELETE FROM calendars WHERE source_id = #{args.source_id}
    ")
    
    puts "Adding calendar for source_id = #{args.source_id}"
    csv = CSV.parse(File.read(Rails.root.join(args.path, 'calendar.txt')), headers: true) do |row|
      Calendar.create!({
        :source_id => args.source_id,
        :service_id  => row['service_id'],
        :monday => row['monday'],
        :tuesday => row['tuesday'],
        :wednesday => row['wednesday'],
        :thursday => row['thursday'],
        :friday => row['friday'],
        :saturday => row['saturday'],
        :sunday => row['sunday'],
        :start_date => row['start_date'],
        :end_date => row['end_date']
      })
    end
  end

  # ================================================================
  # Reload individual cities gtfs based on the tasks above.
  # ================================================================

  task :load_msp_gtfs => :environment do
    Rake::Task['omgtransit:load_gtfs_stops'].invoke(1, 'setup/msp_gtfs', "http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip", 'stop_id')
    # Rake::Task['omgtransit:load_gtfs_stop_times'].invoke(1, 'setup/msp_gtfs')
    # Rake::Task['omgtransit:load_gtfs_trips'].invoke(1, 'setup/msp_gtfs')
    # Rake::Task['omgtransit:load_gtfs_routes'].invoke(1, 'setup/msp_gtfs')
    # Rake::Task['omgtransit:load_gtfs_calendar'].invoke(1, 'setup/msp_gtfs')
  end

  task :load_portland_gtfs => :environment do
    Rake::Task['omgtransit:load_gtfs_stops'].invoke(4, 'setup/portland_gtfs', "http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true&format=json&parser=trimet", 'stop_id')
  end

  task :load_chicago_gtfs => :environment do
    # key - kPhyVbW2qnjqNfQSgvNXbxCsN
    Rake::Task['omgtransit:load_gtfs_stops'].invoke(5, 'setup/chicago_gtfs', "http://www.ctabustracker.com/bustime/api/v1/getpredictions?key=kPhyVbW2qnjqNfQSgvNXbxCsN&stpid={stop_id}&format=xml&parser=clever", 'stop_id')
  end

  task :load_atlanta_gtfs => :environment do
    # GTFS URL - http://www.itsmarta.com/google_transit_feed/google_transit.zip
    Rake::Task['omgtransit:load_gtfs_stops'].invoke(6, 'setup/atlanta_gtfs', "", 'stop_id')
  end

  task :load_washington_dc_gtfs => :environment do
    # GTFS URL - http://www.wmata.com/rider_tools/developer_resources.cfm
    Rake::Task['omgtransit:load_gtfs_stops'].invoke(7, 'setup/washington_dc_gtfs', "http://api.wmata.com/NextBusService.svc/json/jPredictions?StopID={stop_code}&api_key=qbvfs2bv6ad55mjshrw8pjes&callback=?&format=json&parser=wmata", 'stop_code')
  end

  # ================================================================
  # Reindexes stops from master stops into the stops table.
  # ================================================================

  # task :reset_stops => :environment do
  #   puts "Deleting Stops"
  #   ActiveRecord::Base.connection.execute("DELETE FROM stops")
  #   puts "Re-inserting Stops"
  #   ActiveRecord::Base.connection.execute("INSERT INTO stops
  #     (stop_code, stop_name, stop_desc, stop_lat, stop_lon, zone_id, stop_street, stop_city, stop_region, stop_postcode, stop_country)
  #     SELECT
  #     external_stop_id, external_stop_name, external_stop_desc,external_lat, external_lon, external_zone_id, 
  #     external_stop_street, external_stop_city, external_stop_region, external_stop_postcode, external_stop_country
  #     FROM source_stops")
  #   puts "Populating source stops from stops"
  #   ActiveRecord::Base.connection.execute("UPDATE source_stops SET stop_id = (SELECT id FROM stops WHERE stop_code = external_stop_id AND stop_name = external_stop_name)")
  # end
end
