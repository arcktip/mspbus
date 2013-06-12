
namespace :mspbus do
  task :load_stops => :environment do
    require 'csv'
    Stop.delete_all
    # disable mass assignment restrictions
    Stop.send(:attr_protected)

    csv = CSV.parse(File.read(Rails.root.join('data', 'stops.txt')), headers: true) do |row|
      Stop.create!(row.to_hash)
    end

  end
end