# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

[
 { id: 1, name: "MSP_GTFS", url: 'http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip' },
 { id: 2, name: "UMN", url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=umn-twin&stopId={stop_id}&format=xml&parser=nextbus' },
 { id: 3, name: "NEXTRIP", url: '/realtime/niceride?stop_id={stop_id}&format=json&parser=mn_niceride' }
].each do |source|
  Source.find_or_create_by_name(id: source[:id], name: source[:name], realtime_url: source[:url])
end