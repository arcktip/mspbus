# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

[
 { id: 1, name: "MSP", url: 'http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip' },
 { id: 2, name: "UMN", url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=umn-twin&stopId={stop_id}&format=xml&parser=nextbus' },
 { id: 3, name: "NICERIDE", url: '/realtime/niceride?stop_id={stop_id}&format=json&parser=mn_niceride' },
 { id: 4, name: "PORTLAND", url: 'http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true' },
 { id: 5, name: "CHICAGO", url: '' },
 { id: 6, name: "ATLANTA", url: '' },
 { id: 7, name: "WASHINGTONDC", url: 'http://api.wmata.com/NextBusService.svc/json/jPredictions?StopID={stop_code}&api_key=qbvfs2bv6ad55mjshrw8pjes' },
 { id: 8, name: "CAR2GO", url: '/realtime/car2go/{stop_id}?format=json&parser=car2go' },
 { id: 9, name: "AMTRAK", url: '/realtime/amtrak?stop_id={stop_id}&format=json&parser=amtrak' },
 { id: 10, name: "LA", url: 'http://api.metro.net/agencies/lametro/stops/{stop_id}/predictions/?format=json&parser=lametro' }
].each do |source|
  Source.find_or_create_by_name(id: source[:id], name: source[:name], realtime_url: source[:url])
end