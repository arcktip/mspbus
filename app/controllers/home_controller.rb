

class HomeController < ApplicationController
  def index

  end

  def table
    params[:radius] = 1

    @inbounds=true
    # if not (44.47<=params[:lat].to_f and params[:lat].to_f<=45.42 and -94.01<=params[:lon].to_f and params[:lon].to_f<=-92.73)
    #   params[:lat] = 44.979971
    #   params[:lon] = -93.269797
    #   @inbounds=false
    # end

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
      format.all { render :text => '<Response><Gather timeout="10" finishOnKey="*" action="http://omgtransit.org/voice_respond" method="POST"><Say>Please enter the stop I D, then press star.</Say></Gather></Response>' }
    end
  end
  
  def voice_respond
    if not params[:Digits].index(' ')
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
          smess+="The "+item['Route']+" "+item['Terminal']+" going "+item['RouteDirection'].sub("BOUND","")+" is departing in "+item['DepartureText'].sub("Min","Minutes")+". "
        else
          smess+="The "+item['Route']+" "+item['Terminal']+" going "+item['RouteDirection'].sub("BOUND","")+" is departing at "+item['DepartureText']+". "
        end
      end
      if smess[-2]==','
        smess=smess[0..-3]
      end
      if smess==""
        smess="Could not find stop. Please call again."
      end
      respond_to do |format|
        format.all { render :text => "<Response><Say>#{smess}</Say></Response>" }
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
