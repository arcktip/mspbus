# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

[
 { id: 1, name: "MSP_GTFS", url: 'http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json' },
 { id: 2, name: "UMN", url: '/realtime/umn?a=umn-twin&stop_id={stop_id}' }
].each do |source|
  Source.find_or_create_by_name(id: source[:id], name: source[:name], realtime_url: source[:url])
end