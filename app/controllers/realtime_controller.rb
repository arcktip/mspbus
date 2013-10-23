class RealtimeController < ApplicationController
  respond_to :xml, :json

  def niceride
    url = 'https://secure.niceridemn.org/data2/bikeStations.xml'
    response = HTTParty.get(url)
    response = MultiXml.parse(response.body)
    stops = response['stations']['station'].select { |station| station['id'] == "#{params[:stop_id]}" }
    respond_with(stops.to_json)
  end

  def car2go
    respond_with(Stop.get_stop_by_id(params))
  end

  def amtrak
    require 'json'
    require 'open-uri'

    amtrakdata=$redis.get('amtrakdata')
    if not amtrakdata
      #Fetch the data
      url="https://www.googleapis.com/mapsengine/v1/tables/01382379791355219452-08584582962951999356/features?version=published&key=AIzaSyCVFeFQrtk-ywrUE0pEcvlwgCqS6TJcOW4&maxResults=250&callback=jQuery19105907959912437946_1383770388074&dataType=jsonp&jsonpCallback=retrieveTrainsData&contentType=application%2Fjson&_=1383770388076"
      amtrakdata=open(url).read #TODO (from Richard): Add some kind of back-up in case this fails
      $redis.set('amtrakdata',amtrakdata)
      $redis.expire('amtrakdata',60*10) #Expire in ten minutes
    end

    #TODO (from Richard): It would eventually be good to transform all of the data into a format
    #that's friendly to the question "What trains arrive at this station when." as
    #the data arrives in a "This is where the trains are now, and these are the stations
    #they are passing through" AND THEN CACHE THE TRANSFORMED DATA

    #Clean up the data
    amtrakdata=amtrakdata.gsub("jQuery19105907959912437946_1383770388074(","").gsub(");","")
    amtrakdata=JSON.parse(amtrakdata)
    amtrakdata['features'].each do |train|
      train['properties'].keys.each do |key|
        if key[0..6]=='Station'
          train['properties'][key]=JSON.parse(train['properties'][key])
        end
      end
    end

    amtrak_timezones={"E"=>"EST", "C"=>"CST", "M"=>"MST", "P"=>"PST"}

    #Parse the data
    ret=[]
    amtrakdata['features'].each do |train|
      train['properties'].keys.each do |key|
        if key[0..6]=='Station'
          #puts train['properties'][key]['code']
          if train['properties'][key]['code']==params[:stop_id]
            station=train['properties'][key]
            timezone=station['tz']
            timezone=amtrak_timezones[timezone]

            #TODO: Discuss the appropriate order here and whether arrivals should be made visually distinct from departures
            if station['postdep']    #We have real-time departure data!
              departureTime=station['postdep']
              timetype=""
            elsif station['schdep']  #Fall back to scheduled departure information
              departureTime=station['schdep']
              timetype=""
            elsif station['postarr'] #Fall back to real-time arrival information
              departureTime=station['postarr']
              timetype="A"
            elsif station['scharr']  #fall back to scheduled arrival information
              departureTime=station['scharr']
              timetype="A"
            else
              puts "Station error ", station
              next
            end

            departureTime=DateTime.strptime(departureTime+" #{timezone}", '%m/%d/%Y %H:%M:%S %Z')

            if departureTime<DateTime.now #Train has already left
              next
            end

            departureText=departureTime.strftime("%b %-d %-I:%M %p")
            departureTime=departureTime.strftime("%s").to_i
            
            ret<<{:Route          =>train['properties']['TrainNum'], 
                  :Description    =>train['properties']['RouteName'],
                  :RouteDirection =>train['properties']['Heading'],
                  :DepartureTime  =>departureTime,
                  :DepartureText  =>departureText,
                  :TimeType       =>timetype
                }
          end
        end
      end
    end

    respond_with(ret)
  end

end