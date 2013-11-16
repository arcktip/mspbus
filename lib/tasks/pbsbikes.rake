namespace :omgtransit do
  require 'nokogiri'
  require 'httparty'

  task :load_pbsbikes_xml, [:which] => :environment do |t, args|
    source = Source.find_by_name(args.which)
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      next
    elsif source.dataparser!='pbsbikes_xml'
      puts '** Note: This source cannot be parsed as a Public Bike Systems XML'
      next
    end

    puts 'Downloading stops data'
    data=Nokogiri::XML(HTTParty.get(source.stopdata).body)

    puts 'Clearing old data'
    Stop.delete_all(["source_id = ?", source.id])

    puts 'Parsing bike stations'
    data.xpath('//station').each do |stop|

      stop_id   = stop.xpath('id'  ).text
      title     = stop.xpath('name').text
      latitude  = stop.xpath('lat' ).text
      longitude = stop.xpath('long').text
      updated   = stop.xpath('latestUpdateTime').text.to_i/1000 #Convert timestamp to seconds

      #If we haven't heard from a station in more than a week, remove it.
      if Time.now.getutc.to_i-updated>3600*24*7
        puts "Ignoring stop #{stop_id} as it has not recently been updated."
        next
      end

      Stop.skip_callback(:save, :after)
      Stop.create!({
        id:        "#{source.id}-#{stop_id}",
        stop_id:   "#{stop_id}",
        source_id: source.id,
        stop_name: "#{title}",
        stop_lat:  "#{latitude}",
        stop_lon:  "#{longitude}",
        stop_url:  "#{source.name}/#{stop_id}",
        url:       source.realtime_url.gsub('{stop_id}', "#{stop_id}"),
        stop_type: source.transit_type
      })
    end
  end

end
