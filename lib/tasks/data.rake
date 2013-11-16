namespace :omgtransit do

  # =========================================================================
  # Stop type constants (yes they are constants you don't need to check):
  # =========================================================================
  
  ST_BUS   =1
  ST_BIKE  =2
  ST_CAR   =3
  ST_TRAIN =4
  INDEX_NAME = "#{Rails.application.class.parent_name.downcase}_#{Rails.env.to_s.downcase}_stops"

  # =========================================================================
  # Generic task to load gtfs data.  Should be called from helper methods.
  # =========================================================================

  task :load_gtfs_stops, [:source_id, :path, :realtime_url, :replace_column, :stop_type] => :environment do |t, args|
    require 'csv'

    # Remove all previous rows.
    Stop.delete_all(["source_id = ?", args.source_id])

    # Lookup the source name to use for pretty urls.
    source_name = Source.find(args.source_id).name.downcase

    # Remove all from elasticsearch as well.
    query = Tire.search do |search|
      search.query do |q|
        q.terms :source_id, [args.source_id]
      end
    end
    
    index = Tire.index(INDEX_NAME)
    Tire::Configuration.client.delete "#{index.url}/_query?source=#{Tire::Utils.escape(query.to_hash[:query].to_json)}"

    puts "Adding/Updating Stops for #{args.path}"
    csv = CSV.parse(File.read(Rails.root.join(args.path, 'stops.txt')), headers: true) do |row|
      Stop.skip_callback(:save, :after)
      Stop.create!({
        id: "#{args.source_id}-#{row['stop_id']}",
        stop_id: row['stop_id'],
        source_id: args.source_id,
        stop_code: row['stop_code'],
        stop_name: row['stop_name'],
        stop_desc: row['stop_desc'],
        stop_lat: row['stop_lat'],
        stop_lon: row['stop_lon'],
        zone_id: row['zone_id'],
        stop_url: "#{source_name}/#{row['stop_id']}",
        url: args.realtime_url.gsub("{#{args.replace_column}}", row["#{args.replace_column}"]),
        stop_type: args.stop_type
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
        :id => "#{args.source_id}-#{row['route_id']}-#{row['service_id']}-#{row['trip_id']}",
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
        :id => "#{args.source_id}-#{row['route_id']}-#{row['agency_id']}",
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
        :id => "#{args.source_id}-#{row['service_id']}",
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
  # Run these using, e.g., "rake omgtransit:load_gtfs[AMTRAK]"

  task :load_gtfs, [:which_gtfs] => :environment do |t, args|
    source = Source.find_by_name(args.which_gtfs)
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      next
    end

    case args.which_gtfs
    when 'AMTRAK'
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/amtrak_gtfs', "/realtime/amtrak?stop_id={stop_id}&format=json&parser=amtrak", 'stop_id', ST_TRAIN)
    when 'ATLANTA' # GTFS URL - http://www.itsmarta.com/google_transit_feed/google_transit.zip
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/atlanta_gtfs', "", 'stop_id', ST_BUS)
    when 'CHICAGO' # key - kPhyVbW2qnjqNfQSgvNXbxCsN
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/chicago_gtfs', "http://www.ctabustracker.com/bustime/api/v1/getpredictions?key=kPhyVbW2qnjqNfQSgvNXbxCsN&stpid={stop_id}&format=xml&parser=clever", 'stop_id', ST_BUS)
    when 'LA'
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/la_gtfs', "http://api.metro.net/agencies/lametro/stops/{stop_id}/predictions/?format=json&parser=lametro", 'stop_id', ST_BUS)
    when 'MSP'
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/msp_gtfs', "http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip", 'stop_id', ST_BUS)
    when 'PORTLAND'
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/portland_gtfs', "http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true&format=json&parser=trimet", 'stop_id', ST_BUS)
    when 'WASHINGTONDC' # GTFS URL - http://www.wmata.com/rider_tools/developer_resources.cfm
      Rake::Task['omgtransit:load_gtfs_stops'].invoke(source.id, 'setup/washington_dc_gtfs', "http://api.wmata.com/NextBusService.svc/json/jPredictions?StopID={stop_code}&api_key=qbvfs2bv6ad55mjshrw8pjes&callback=?&format=json&parser=wmata", 'stop_code', ST_BUS)
    else
      puts "I couldn't find that GTFS source!"
    end
  end




  # ================================================================
  # RELOAD EVERYTHING: Major database changes only
  # ================================================================

  task :reload_everything => :environment do
    Rake::Task['omgtransit:load_gtfs'].invoke('MSP')
    Rake::Task['omgtransit:load_umn_stops'].invoke()
    Rake::Task['omgtransit:reload_car2go'].invoke()
    Rake::Task['omgtransit:load_gtfs'].invoke('AMTRAK')
  end
end
