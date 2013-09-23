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
 { id: 3, name: "NEXTRIP", url: '/realtime/niceride?stop_id={stop_id}&format=json&parser=mn_niceride' },
 { id: 4, name: "PORTLAND_GTFS", url: 'http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true' },
 { id: 5, name: "CHICAGO_GTFS", url: '' },
 { id: 6, name: "ATLANTA_GTFS", url: '' },
 { id: 7, name: "WASHINGTONDC_GTFS", url: 'http://api.wmata.com/NextBusService.svc/json/jPredictions?StopID={stop_code}&api_key=qbvfs2bv6ad55mjshrw8pjes' }
].each do |source|
  Source.find_or_create_by_name(id: source[:id], name: source[:name], realtime_url: source[:url])
end