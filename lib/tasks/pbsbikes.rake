namespace :omgtransit do
  require 'rubygems'
  require 'bundler'
  Bundler.setup
  require 'nokogiri'
  require 'httparty'

  module NiceRide
    class Stops
      attr_accessor :xml_data, :stops

      BIKE_URL = 'https://secure.niceridemn.org/data2/bikeStations.xml'
      
      def initialize()
      end

      def self.get_stops       
        get_stop_list.xpath('//station').map{ |stop| Stop.new(stop) }
      end

      def self.get_stop_list
        Nokogiri::XML(HTTParty.get(BIKE_URL).body)
      end

      def get_route_config
        Nokogiri::XML(HTTParty.get(ROUTE_CONFIG_URL+@xml_data.attributes['tag'].value).body)
      end
    end

    class Stop
      attr_accessor :xml_data, :stop_id, :title, :short_title, :latitude, :longitude

      def initialize(stop)
        @xml_data = stop
        @stop_id = xml_data.xpath('id').text
        @title = xml_data.xpath('name').text
        @latitude = xml_data.xpath('lat').text
        @longitude = xml_data.xpath('long').text
      end
    end
  end

  task :load_mn_bikes => :environment do
    # Todo: Re-write this in the realtime section for next spring.
    # SourceStop.delete_all("source_id = 3")

    # NiceRide::Stops.get_stops.each do |stop|
    #   SourceStop.find_or_initialize_by_source_id_and_external_stop_id(3, "#{stop.stop_id}") do |ss|
    #     ss.external_stop_id   = "#{stop.stop_id}"
    #     ss.external_lat       = "#{stop.latitude}"
    #     ss.external_lon       = "#{stop.longitude}"
    #     ss.external_stop_url  = "/realtime/niceride?stop_id=#{stop.stop_id}&format=json&parser=mn_niceride"
    #     ss.external_stop_name = "#{stop.title}"
    #     ss.stop_type          = 2
    #      stop_url: "#{source_name}/#{row['stop_id']}",
    #     ss.save!
    #   end
    # end
  end

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
