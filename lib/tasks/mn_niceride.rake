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
    SourceStop.delete_all("source_id = 3")

    NiceRide::Stops.get_stops.each do |stop|
      SourceStop.find_or_initialize_by_source_id_and_external_stop_id(3, "#{stop.stop_id}") do |ss|
        ss.external_stop_id   = "#{stop.stop_id}"
        ss.external_lat       = "#{stop.latitude}"
        ss.external_lon       = "#{stop.longitude}"
        ss.external_stop_url  = "/realtime/niceride?stop_id=#{stop.stop_id}&format=json&parser=mn_niceride"
        ss.external_stop_name = "#{stop.title}"
        ss.stop_type          = 2
        ss.save!
      end
    end
  end

end
