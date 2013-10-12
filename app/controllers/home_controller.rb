class HomeController < ApplicationController
  def index

  end

  def table
    #First we'll see if there are any stops within 10 miles of the user
    @in_bounds=true
    params[:radius] = 10
    bounds_stops = Stop.search(params)

    #If there were no stops within 10 miles, probably the user is not part
    #of our service area. Make a note of this and give them a default location.
    if bounds_stops.results.empty?
      @in_bounds=false
      params[:lat]= 44.980522382993826
      params[:lon]=-93.27006340026855
    end

    #Use the user's location and find all stops within 1 mile of it
    params[:radius] = 1
    @stops = Stop.search(params)
    @lat=params[:lat]
    @lon=params[:lon]

    render :layout => false
  end

  def favlist
    @stops=Array.new
    if params[:favs]

      params[:favs][1..-1].split(',').each do |stop|
        res=Stop.get_stop_by_id({:id=>stop}).results
        if not res.empty?
          @stops.push(Stop.get_stop_by_id({:id=>stop}).results.first())
        end
      end

    end

    render :layout => false
  end

  def sms
    #render :layout => false
    
    #  Twilio POST request parameters
    #  Parameter	Description
    #  SmsSid	A 34 character unique identifier for the message. May be used to later retrieve this message from the REST API.
    #  AccountSid	The 34 character id of the Account this message is associated with.
    #  From	The phone number that sent this message.
    #  To	The phone number of the recipient.
    #  Body	The text body of the SMS message. Up to 160 characters long.
    if not params[:Body].index(' ')
      stopid=params[:Body]
      puts '===='
      puts stopid
      stops=Stop.get_stop_by_id({:id=>stopid})
      if stops.results.empty?
        @smess = "Couldn't find stop."
      end

      response = HTTParty.get("http://svc.metrotransit.org/NexTrip/#{stopid}?format=json")
      if not response.code==200
        @smess = "An error occoured! Sorry."
      end
      stopfound=true

      @smess=""
      response.each do |item|
        @smess+=item['RouteDirection'][0]+item['Route']+item['Terminal']+" "+item['DepartureText']+", "
      end
      @smess=@smess[0..159]
      if @smess[-2]==','
        @smess=@smess[0..-3]
      end
      respond_to do |format|
      	format.all { render :text => "<Response><Sms>#{@smess}</Sms></Response>" }
      end
    else
      puts "Space"
    end
  end
  
  def voice
    respond_to do |format|
      format.all { render :text => '<Response><Gather timeout="30" finishOnKey="#" action="http://omgtransit.com/voice_respond" method="POST"><Say>Please enter the stop I D, then press pound.</Say></Gather></Response>' }
    end
  end
  
  def voice_respond
    if not params[:Digits].empty?
      stopid=params[:Digits]
      stops=Stop.get_stop_by_id({:id=>stopid})
      if stops.results.empty?
        smess = "Couldn't find stop."
      end

      response = HTTParty.get("http://svc.metrotransit.org/NexTrip/#{stopid}?format=json")
      if not response.code==200
        smess = "An error occoured! Sorry."
      end
      stopfound=true

      smess=""
      response.each do |item|
        if not item['DepartureText'].include? ":"
          smess+="The "+item['Route']+" "+item['Terminal']+" going "+item['RouteDirection'].sub("BOUND","")+" is arriving in "+item['DepartureText'].sub("Min","Minutes")+". "
        else
          smess+="The "+item['Route']+" "+item['Terminal']+" going "+item['RouteDirection'].sub("BOUND","")+" is arriving at "+item['DepartureText']+". "
        end
      end
      if smess[-2]==','
        smess=smess[0..-3]
      end
      if smess==""
        respond_to do |format|
         format.all { render :text => "<Response><Say>Could not find stop!</Say><Redirect method='POST'>http://omgtransit.com/voice</Redirect></Response>" }
        end
      else
        respond_to do |format|
          format.all { render :text => "<Response><Say>#{smess}</Say></Response>" }
        end
      end
    else
      respond_to do |format|
        format.all { render :text => "<Response><Say>No data was recieved.</Say></Response>" }
      end
    end
  end

  def about

  end
  
  def feedback
    
  end
end
