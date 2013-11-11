class RealtimeController < ApplicationController
  respond_to :xml, :json

  def niceride
    url = 'https://secure.niceridemn.org/data2/bikeStations.xml'
    response = HTTParty.get(url)
    stops = response.parsed_response['stations']['station'].select { |station| station['id'] == "#{params[:stop_id]}" }
    respond_with(stops.to_json)
  end

  def car2go
    respond_with(Stop.get_stop_by_id(params))
  end

  def amtrak
    require 'json'
    require 'open-uri'

    #Fetch the data
    url="https://www.googleapis.com/mapsengine/v1/tables/01382379791355219452-08584582962951999356/features?version=published&key=AIzaSyCVFeFQrtk-ywrUE0pEcvlwgCqS6TJcOW4&maxResults=250&callback=jQuery19105907959912437946_1383770388074&dataType=jsonp&jsonpCallback=retrieveTrainsData&contentType=application%2Fjson&_=1383770388076"
    r=open(url).read

    #Clean up the data
    r=r.gsub("jQuery19105907959912437946_1383770388074(","").gsub(");","")
    r=JSON.parse(r)
    r['features'].each do |train|
      train['properties'].keys.each do |key|
        if key[0..6]=='Station'
          train['properties'][key]=JSON.parse(train['properties'][key])
        end
      end
    end


    #Parse the data
    ret=[]
    r['features'].each do |train|
      train['properties'].keys.each do |key|
        if key[0..6]=='Station'
          #puts train['properties'][key]['code']
          if train['properties'][key]['code']==params[:stop_id]
            ret<<{:Route          =>train['properties']['TrainNum'], 
                  :Description     =>train['properties']['RouteName'],
                  :RouteDirection  =>train['properties']['Heading'],
                  :arrival         =>train['properties'][key]['postarr'] #When the train should arrive, in real-time
                }
          end
        end
      end
    end

    respond_with(ret)
  end

end