namespace :omgtransit do
  require 'rubygems'
  require 'bundler'
  Bundler.setup
  require 'nokogiri'
  require 'httparty'

  # =========================================================================
  # Stop type constants (yes they are constants you don't need to check):
  # =========================================================================
  
  ST_BUS   =1
  ST_BIKE  =2
  ST_CAR   =3
  ST_TRAIN =4
  INDEX_NAME = "#{Rails.application.class.parent_name.downcase}_#{Rails.env.to_s.downcase}_stops"

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
    
    source = Source.find_by_name('UMN')

    unless source.nil?
      Stop.delete_all("source_id = #{source.id}")

      # Remove all from elasticsearch as well.
      query = Tire.search do |search|
        search.query do |q|
          q.terms :source_id, [source.id]
        end
      end
      
      index = Tire.index(INDEX_NAME)
      Tire::Configuration.client.delete "#{index.url}/_query?source=#{Tire::Utils.escape(query.to_hash[:query].to_json)}"


      UMN_Connector::Route.get_routes.each do |route|
        route.stops.each do |stop|
          Stop.skip_callback(:save, :after)
          begin 
            Stop.create!({
              id:        "#{source.id}-#{stop.stop_id}",
              stop_id:   stop.stop_id,
              source_id: source.id,
              stop_name: "#{stop.title}",
              stop_desc: "#{stop.title}",
              stop_lat:  "#{stop.latitude}",
              stop_lon:  "#{stop.longitude}",
              url: "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=umn-twin&stopId=#{stop.stop_id}&format=xml&parser=nextbus&logo=umn.png",
              stop_type: ST_BUS
            })
          rescue ActiveRecord::RecordNotUnique => e
            puts "Stop #{stop.stop_id} was not unique, but that's probably okay."
          end
        end
      end
    else
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'
    end

  end

end
