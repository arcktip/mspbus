namespace :mspbus do
  require 'rubygems'
  require 'bundler'
  Bundler.setup
  require 'nokogiri'
  require 'httparty'

  module UMN_Connector
    class Route
      attr_accessor :xml_data, :stops

      ROUTE_LIST_URL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=umn-twin'
      ROUTE_CONFIG_URL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=umn-twin&r='

      def initialize(route)
        @xml_data = route
        @stops = []
        get_route_config.xpath('/body/route/stop').each do |s| 
          stops << Stop.new(s)
        end
      end

      def self.get_routes
        get_route_list.xpath('//route').map{ |route| new(route) }
      end

      def self.get_route_list
        Nokogiri::XML(HTTParty.get(ROUTE_LIST_URL).body)
      end

      def get_route_config
        Nokogiri::XML(HTTParty.get(ROUTE_CONFIG_URL+@xml_data.attributes['tag'].value).body)
      end
    end

    class Stop
      attr_accessor :xml_data, :stop_id, :title, :short_title, :latitude, :longitude

      def initialize(stop)
        @xml_data = stop
        @stop_id = xml_data.attributes['stopId']
        @title = xml_data.attributes['title']
        @short_title = xml_data.attributes['shortTitle']
        @latitude = xml_data.attributes['lat']
        @longitude = xml_data.attributes['lon']
        # xml_data.attributes['latMin']
        # xml_data.attributes['latMax']
        # xml_data.attributes['lonMin']
        # xml_data.attributes['lonMax']
      end
    end
  end

  task :load_umn_stops => :environment do
    SourceStop.where(source_id: 2).each{ |stop| stop.destroy }
    UMN_Connector::Route.get_routes.each do |route|
      route.stops.each do |stop|
        SourceStop.find_or_initialize_by_source_id_and_external_stop_id(2, "#{stop.stop_id}") do |ss|
          ss.external_stop_id = "#{stop.stop_id}"
          ss.external_lat = "#{stop.latitude}"
          ss.external_lon = "#{stop.longitude}"
          ss.external_stop_url = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=umn-twin&stopId=#{stop.stop_id}&format=xml&parser=nextbus&logo=umn.png"
          ss.external_stop_name = "#{stop.title}"
          ss.save!
        end
      end
    end
  end

end