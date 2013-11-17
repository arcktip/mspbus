namespace :omgtransit do
#License: https://developer.jcdecaux.com/#/opendata/licence
  require 'httparty'
  require 'json'

  task :load_cyclocitys => :environment do
    source = Source.find_by_name('CycloCity')
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    end

    puts 'Clearing old data'
    Stop.delete_all(["source_id = ?", source.id])

    puts "Downloading contracts data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    data.each do |contract|
      puts "Downloading stops data for #{contract['name']}"
      url='https://api.jcdecaux.com/vls/v1/stations?apiKey=6a532d98e0ec45b44c8007d1d342d3abd44ecfcc&contract={contract}'.gsub('{contract}',contract['name'])
      contractdata=HTTParty.get(url).body
      contractdata=JSON.parse(contractdata)
      contractdata.each do |stop|
        Stop.skip_callback(:save, :after)
        Stop.create!({
          id:            "#{source.id}-#{contract['name']}/#{stop['number']}",
          stop_id:       "#{stop['number']}",
          source_id:     source.id,
          stop_name:     "#{stop['name']}",
          stop_lat:      "#{stop['position']['lat']}",
          stop_lon:      "#{stop['position']['lng']}",
          stop_street:   "#{stop['address']}",
          stop_city:     "#{contract['name']}",
          stop_country:  "#{contract['country_code']}",
          stop_url:      "#{source.name}/#{contract['name']}/#{stop['number']}",
          url:           source.realtime_url.gsub('{stop_id}', "#{stop['number']}").gsub('{contract}', "#{contract['name']}"),
          stop_type:     source.transit_type
        })
      end
    end
  end




  task :update_cyclocity_info => :environment do
    source = Source.find_by_name('CycloCity')
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      return
    end

    puts "Downloading contracts data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    data.each do |contract|
      puts "Downloading stops data for #{contract['name']}"
      url='https://api.jcdecaux.com/vls/v1/stations?apiKey=6a532d98e0ec45b44c8007d1d342d3abd44ecfcc&contract={contract}'.gsub('{contract}',contract['name'])
      contractdata=HTTParty.get(url).body
      contractdata=JSON.parse(contractdata)
      contractdata.each do |stop|
        $redis.set "#{source.id}-#{contract['name']}/#{stop['number']}", {:nbBikes=>"#{stop['available_bikes']}", :nbEmptyDocks=>"#{stop['available_bike_stands']}"}.to_json
      end
    end

  end

end
