class HomeController < ApplicationController
  def index

  end

  def table
    params[:radius] = 1

    @inbounds=true
    if not (44.47<=params[:lat].to_f and params[:lat].to_f<=45.42 and -94.01<=params[:lon].to_f and params[:lon].to_f<=-92.73)
      params[:lat] = 44.979971
      params[:lon] = -93.269797
      @inbounds=false
    end

    @stops = Stop.search(params)
    @lat=params[:lat]
    @lon=params[:lon]

    render :layout => false
  end

  def sms
    #  Twilio POST request parameters
    #  Parameter	Description
    #  SmsSid	A 34 character unique identifier for the message. May be used to later retrieve this message from the REST API.
    #  AccountSid	The 34 character id of the Account this message is associated with.
    #  From	The phone number that sent this message.
    #  To	The phone number of the recipient.
    #  Body	The text body of the SMS message. Up to 160 characters long.
    if not params[:Body].index(' ')
      @stopid=params[:Body]
      @stops=Stop.get_stop_by_id({:id=>@stopid})
      if @stops.results.empty?
        @stopfound=false
        return
      end

      response = HTTParty.get("http://svc.metrotransit.org/NexTrip/#{@stopid}?format=json")
      puts "http://svc.metrotransit.org/NexTrip/#{@stopid}?format=json"
      if not response.code==200
        @error=true
        return
      end
      @stopfound=true
      puts response.body, response.code, response.message, response.headers.inspect
      arrivals = JSON.parse response.body

      @smess=""
      response.each do |item|
        @smess+=item['RouteDirection'][0]+item['Route']+item['Terminal']+" "+item['DepartureText']+", "
      end
      @smess=@smess[0..159]
      if @smess[-2]==','
        @smess=@smess[0..-3]
      end
    else
      puts "Space"
    end

    render :layout => false
  end

  def about

  end
  
  def feedback
    
  end
end
