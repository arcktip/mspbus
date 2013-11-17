namespace :omgtransit do
  require 'httparty'
  require 'json'

  task :load_airports => :environment do
    source = Source.find_by_dataparser('flightstats')
    if source.nil?
      puts '** Note: There was no source definition for this task. Please add a source to the seeds file and run rake db:seed'      
      next
    end

    puts "Downloading stops data for #{source.name}"
    data=HTTParty.get(source.stopdata).body
    data=JSON.parse(data)

    puts 'Clearing old data'
    Stop.delete_all(["source_id = ?", source.id])

    puts 'Parsing airports'
    data['airports'].each do |stop|
      #TODO: There seems to be no way to see when the station info was last updated

      Stop.skip_callback(:save, :after)
      Stop.create!({
        id:           "#{source.id}-#{stop['fs']}",
        stop_id:      "#{stop['fs']}",
        source_id:    source.id,
        stop_name:    "#{stop['name']}",
        stop_lat:     "#{stop['latitude']}",
        stop_lon:     "#{stop['longitude']}",
        stop_city:    "#{stop['city']}",
        stop_country: "#{stop['countryName']}",
        stop_url:     "#{source.name}/#{stop['fs']}",
        url:          source.realtime_url.gsub('{stop_id}', "#{stop['fs']}"),
        stop_type:    source.transit_type
      })
    end
  end


  task :update_pbsbike_info => :environment do
    sources = Source.where("dataparser LIKE ?","pbsbikes%")
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
