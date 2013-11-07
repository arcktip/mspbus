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

end