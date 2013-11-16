namespace :omgtransit do
  require 'nokogiri'
  require 'httparty'
  require 'json'

  def load_pbsbikes_xml(which_bikes)
    source = Source.find_by_name(which_bikes)
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    elsif source.dataparser!='pbsbikes_xml'
      puts '** Note: This source cannot be parsed as a Public Bike Systems XML'
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=Nokogiri::XML(HTTParty.get(source.stopdata).body)

    puts 'Clearing old data'
    Stop.delete_all(["source_id = ?", source.id])

    puts 'Parsing bike stations'
    data.xpath('//station').each do |stop|

      stop_id   = stop.xpath('id'  ).text
      title     = stop.xpath('name').text
      latitude  = stop.xpath('lat' ).text
      longitude = stop.xpath('long').text
      updated   = stop.xpath('latestUpdateTime').text.to_i/1000 #Convert timestamp to seconds

      #If we haven't heard from a station in more than a week, remove it.
      if Time.now.getutc.to_i-updated>3600*24*7
        puts "Ignoring stop #{stop_id} as it has not recently been updated."
        next
      end

      Stop.skip_callback(:save, :after)
      Stop.create!({
        id:        "#{source.id}-#{stop_id}",
        stop_id:   "#{stop_id}",
        source_id: source.id,
        stop_name: "#{title}",
        stop_lat:  "#{latitude}",
        stop_lon:  "#{longitude}",
        stop_url:  "#{source.name}/#{stop_id}",
        url:       source.realtime_url.gsub('{stop_id}', "#{stop_id}"),
        stop_type: source.transit_type
      })
    end
  end

  def load_pbsbikes_json(which_bikes)
    source = Source.find_by_name(which_bikes)
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    elsif source.dataparser!='pbsbikes_json'
      puts '** Note: This source cannot be parsed as a Public Bike Systems JSON'
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    puts 'Clearing old data'
    Stop.delete_all(["source_id = ?", source.id])

    puts 'Parsing bike stations'
    data['stationBeanList'].each do |stop|
      #TODO: There seems to be no way to see when the station info was last updated

      Stop.skip_callback(:save, :after)
      Stop.create!({
        id:        "#{source.id}-#{stop['id']}",
        stop_id:   "#{stop['id']}",
        source_id: source.id,
        stop_name: "#{stop['stationName']}",
        stop_lat:  "#{stop['latitude']}",
        stop_lon:  "#{stop['longitude']}",
        stop_city: "#{stop['city']}",
        stop_url:  "#{source.name}/#{stop['id']}",
        url:       source.realtime_url.gsub('{stop_id}', "#{stop['id']}"),
        stop_type: source.transit_type
      })
    end
  end





  def load_pbsbike_info_xml(which_bikes)
    source = Source.find_by_name(which_bikes)
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    elsif source.dataparser!='pbsbikes_xml'
      puts '** Note: This source cannot be parsed as a Public Bike Systems XML'
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=Nokogiri::XML(HTTParty.get(source.stopdata).body)

    puts 'Parsing bike stations'
    data.xpath('//station').each do |stop|

      stop_id      = stop.xpath('id'  ).text
      nbBikes      = stop.xpath('nbBikes').text
      nbEmptyDocks = stop.xpath('nbEmptyDocks').text

      $redis.set "#{source.id}-#{stop_id}", {:nbBikes=>nbBikes, :nbEmptyDocks=>nbEmptyDocks}.to_json
    end
  end


  def load_pbsbike_info_json(which_bikes)
    source = Source.find_by_name(which_bikes)
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    elsif source.dataparser!='pbsbikes_json'
      puts '** Note: This source cannot be parsed as a Public Bike Systems JSON'
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    puts 'Parsing bike stations'
    data['stationBeanList'].each do |stop|
      #TODO: There seems to be no way to see when the station info was last updated
      $redis.set "#{source.id}-#{stop['id']}", {:nbBikes=>"#{stop['availableBikes']}", :nbEmptyDocks=>"#{stop['availableDocks']}"}.to_json
    end
  end















  task :load_pbsbikes_xml, [:which] => :environment do |t, args|
    load_pbsbikes_xml(args.which)
  end

  task :load_pbsbikes_json, [:which] => :environment do |t, args|
    load_pbsbikes_json(args.which)
  end


  task :load_pbsbikes => :environment do
    sources = Source.where('transit_type=2') #Get all bike shares
    sources.each do |source|
      if    source.dataparser=='pbsbikes_xml'
        load_pbsbikes_xml(source.name)
      elsif source.dataparser=='pbsbikes_json'
        load_pbsbikes_json(source.name)
      else
        puts "Can't parse #{source.name}."
      end
    end
  end


  task :update_pbsbike_info => :environment do
    sources = Source.where('transit_type=2') #Get all bike shares
    sources.each do |source|
      if    source.dataparser=='pbsbikes_xml'
        load_pbsbike_info_xml(source.name)
      elsif source.dataparser=='pbsbikes_json'
        load_pbsbike_info_json(source.name)
      else
        puts "Can't parse #{source.name}."
      end
    end
  end

end
