class RealtimeController < ApplicationController
  respond_to :xml, :json

  def umn
    url = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=#{params[:a]}&stopId=#{params[:stop_id]}"
    response = HTTParty.get(url)
    raise response.parsed_response['body']['predictions'][1].to_yaml
    data = response.parsed_response['body']['predictions']['direction']['prediction']
    
    formated_response = []
    data.map do |d|
      if d['minutes'] == 0
        dText = 'Due'
      else
        dText =  d['minutes'] + ' min'
      end
        
      formated_response << {
        'DepartureText' => dText, 
        'DepartureTime' => '/Date(' + d['epochTime'] + '-0500)/',
        'RouteDirection' => d['dirTag'].upcase + 'BOUND',
        'Route' => 'UMN-CC'
      }
    end 
    respond_with(formated_response.to_json)
  end

  def nextrip
    url = "http://svc.metrotransit.org/NexTrip/#{params[:stop_id]}?format=json"
    response = HTTParty.get(url)
    respond_with(response)
  end

  def niceride
    url = 'https://secure.niceridemn.org/data2/bikeStations.xml'
    response = HTTParty.get(url)
    stops = response.parsed_response['stations']['station'].select { |station| station['id'] == "#{params[:stop_id]}" }
    respond_with(stops.to_json)
  end

end