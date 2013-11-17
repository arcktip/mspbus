namespace :omgtransit do
  require 'httparty'
  require 'json'

  task :load_bikeshare_melbourne => :environment do
    source = Source.find_by_dataparser('bikeshare_melbourne')
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
    data.each do |stop|
      #TODO: There seems to be no way to see when the station info was last updated

      Stop.skip_callback(:save, :after)
      Stop.create!({
        id:           "#{source.id}-#{stop['id']}",
        stop_id:      "#{stop['id']}",
        source_id:    source.id,
        stop_name:    "#{stop['name']}",
        stop_lat:     "#{stop['lat']}",
        stop_lon:     "#{stop['long']}",
        stop_city:    'Melbourne',
        stop_country: 'Australia',
        stop_url:     "#{source.name}/#{stop['id']}",
        url:       source.realtime_url.gsub('{stop_id}', "#{stop['id']}"),
        stop_type: source.transit_type
      })
    end
  end


  task :update_bikeshare_melbourne_info => :environment do
    source = Source.find_by_dataparser('bikeshare_melbourne')
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    end

    puts "Downloading stops data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    puts 'Parsing bike stations'
    data.each do |stop|
      $redis.set "#{source.id}-#{stop['id']}", {:nbBikes=>"#{stop['nbBikes']}", :nbEmptyDocks=>"#{stop['nbEmptyDocks']}"}.to_json
    end
  end

end
