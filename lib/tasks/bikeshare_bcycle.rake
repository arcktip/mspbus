namespace :omgtransit do
  require 'httparty'
  require 'json'

  task :load_bcycles => :environment do
    source = Source.find_by_name('Bcycle')
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    puts 'Clearing old data'
    Stop.delete_all(["source_id = ?", source.id])

    puts 'Parsing bike stations'
    data['d']['list'].each do |stop|
      #TODO (from Richard): There seems to be no way to see when the station info was last updated
      #TODO (from Richard): These stations have hours of operation. What should be done about this?

      Stop.skip_callback(:save, :after)
      Stop.create!({
        id:            "#{source.id}-#{stop['Id']}",
        stop_id:       "#{stop['Id']}",
        source_id:     source.id,
        stop_name:     "#{stop['Name']}",
        stop_lat:      "#{stop['Location']['Latitude']}",
        stop_lon:      "#{stop['Location']['Longitude']}",
        stop_street:   "#{stop['Address']['Street']}",
        stop_city:     "#{stop['Address']['City']}",
        stop_region:   "#{stop['Address']['State']}",
        stop_postcode: "#{stop['Address']['ZipCode']}",
        stop_url:      "#{source.name}/#{stop['Id']}",
        url:           source.realtime_url.gsub('{stop_id}', "#{stop['Id']}"),
        stop_type:     source.transit_type
      })
    end
  end


  task :update_bcycle_info => :environment do
    source = Source.find_by_name('Bcycle')
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    puts 'Parsing bike stations'
    data['d']['list'].each do |stop|
      #TODO: There seems to be no way to see when the station info was last updated
      $redis.set "#{source.id}-#{stop['Id']}", {:nbBikes=>"#{stop['BikesAvailable']}", :nbEmptyDocks=>"#{stop['DocksAvailable']}", :nbTrikes=>"#{stop['TrikesAvailable']}"}.to_json
    end
  end

end
