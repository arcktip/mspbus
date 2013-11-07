namespace :omgtransit do
  require 'httparty'

  # =================================================
  # Car2go
  # =================================================

  task :reload_car2go => :environment do |t, args|
    CONSUMER_KEY = 'OMGTransit'
    CAR2GO_LOCATIONS_URL = "https://www.car2go.com/api/v2.1/locations?oauth_consumer_key=#{CONSUMER_KEY}&format=json"
    CAR2GO_VEHICLES_URL = "https://www.car2go.com/api/v2.1/vehicles?loc=minneapolis&oauth_consumer_key=#{CONSUMER_KEY}&format=json"
    INDEX_NAME = "#{Rails.application.class.parent_name.downcase}_#{Rails.env.to_s.downcase}_stops"

    source_id = Source.get_source_by_key('CAR2GO').first.id

    cars = []
    response = HTTParty.get(CAR2GO_VEHICLES_URL).parsed_response['placemarks']
    response.each do |car|
      cars << {
        id: "#{source_id}-#{car['vin']}",
        type: 'stop',
        stop_id: car['vin'],
        source_id: source_id,
        stop_desc: "",
        stop_name: car['name'],
        stop_city: "Minneapolis",
        stop_street: car['address'],
        location: [car['coordinates'][0], car['coordinates'][1]],
        url: "/realtime/car2go/#{source_id}-#{car['vin']}?format=json&parser=car2go",
        stop_type: 3,
        extra: {
          engineType: car['engineType'],
          exterior: car['exterior'],
          fuel: car['fuel'],
          interior: car['interior']
        }
      }
    end
    
    query = Tire.search do |search|
      search.query do |q|
        q.terms :source_id, [source_id]
      end
    end
    
    index = Tire.index(INDEX_NAME)
    Tire::Configuration.client.delete "#{index.url}/_query?source=#{Tire::Utils.escape(query.to_hash[:query].to_json)}"
      
    Tire.index INDEX_NAME do
      import cars
    end
  end

  # =================================================
  # NiceRide
  # =================================================

end