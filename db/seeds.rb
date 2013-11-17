# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

ST_BUS   =1
ST_BIKE  =2
ST_CAR   =3
ST_TRAIN =4

Source.delete_all()

[
 {
    id: 1, 
    name:         "MSP", 
    url:          'http://svc.metrotransit.org/NexTrip/{stop_id}?callback=?&format=json&parser=nextrip',
    stopdata:     'ftp://gisftp.metc.state.mn.us/google_transit.zip',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 {
    id: 2, 
    name:         "UMN", 
    url:          'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=umn-twin&stopId={stop_id}&format=xml&parser=nextbus',
    stopdata:     '',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 { #Minneapolis Bicycle Share
    id: 3, 
    name:         "NICERIDE", 
    url:          '/realtime/pbsbikes?source_id=3&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://secure.niceridemn.org/data2/bikeStations.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE
 },
 {
    id: 4, 
    name:         "PORTLAND", 
    url:          'http://developer.trimet.org/ws/V1/arrivals?locIDs={stop_id}&appID=B032DC6A5D4FBD9A8318F7AB1&json=true',
    stopdata:     'http://developer.trimet.org/schedule/gtfs.zip',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 {
    id: 5, 
    name:         "CHICAGO", 
    url:          'http://www.ctabustracker.com/bustime/api/v1/getpredictions?key=kPhyVbW2qnjqNfQSgvNXbxCsN&stpid={stop_id}&format=xml&parser=clever',
    stopdata:     'http://www.transitchicago.com/downloads/sch_data/google_transit.zip',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 {
    id: 6, 
    name:         "ATLANTA", 
    url:          '',
    stopdata:     'http://www.itsmarta.com/google_transit_feed/google_transit.zip',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 {
    id: 7, 
    name:         "WASHINGTONDC", 
    url:          'http://api.wmata.com/NextBusService.svc/json/jPredictions?StopID={stop_id}&api_key=qbvfs2bv6ad55mjshrw8pjes',
    stopdata:     'http://lrg.wmata.com/GTFS_data/google_transit.zip',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 {
    id: 8, 
    name:         "CAR2GO", 
    url:          '/realtime/car2go/{stop_id}?format=json&parser=car2go',
    stopdata:     '',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 {
    id: 9, 
    name:         "AMTRAK", 
    url:          '/realtime/amtrak?stop_id={stop_id}&format=json&parser=amtrak',
    stopdata:     'http://www.itsmarta.com/google_transit_feed/google_transit.zip',
    dataparser:   'gtfs',
    transit_type: ST_TRAIN
 },
 {
    id: 10,
    name:         "LA",
    url:          'http://api.metro.net/agencies/lametro/stops/{stop_id}/predictions/?format=json&parser=lametro',
    stopdata:     'http://developer.metro.net/gtfs/google_transit.zip',
    dataparser:   'gtfs',
    transit_type: ST_BUS
 },
 { #Washington, DC Bicycle Share
    id: 11, 
    name:         "CapitolBikeShare", 
    url:          '/realtime/pbsbikes?source_id=11&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://capitalbikeshare.com/data/stations/bikeStations.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE
 },
 { #Boston Bicycle Share
    id: 12, 
    name:         "TheHubway", 
    url:          '/realtime/pbsbikes?source_id=12&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://thehubway.com/data/stations/bikeStations.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE
 },
 { #San Francisco Bicycle Share
    id: 13, 
    name:         "BayAreaBikeShare", 
    url:          '/realtime/pbsbikes?ssource_id=13&top_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://bayareabikeshare.com/stations/json/ ',
    dataparser:   'pbsbikes_json',
    transit_type: ST_BIKE
 },
 { #New York City Bicycle Share
    id: 14, 
    name:         "CitiBike", 
    url:          '/realtime/pbsbikes?source_id=14&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://citibikenyc.com/stations/json/',
    dataparser:   'pbsbikes_json',
    transit_type: ST_BIKE
 },
 { #Chicago Bicycle Share
    id: 15, 
    name:         "DivvyBikes", 
    url:          '/realtime/pbsbikes?source_id=15&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://divvybikes.com/stations/json/',
    dataparser:   'pbsbikes_json',
    transit_type: ST_BIKE
 },
 { #Chattanooga Bicycle Share
    id: 16, 
    name:         "BikeChattanooga", 
    url:          '/realtime/pbsbikes?source_id=16&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://www.bikechattanooga.com/stations/json/',
    dataparser:   'pbsbikes_json',
    transit_type: ST_BIKE
 },
 { #Columbus, OH Bicycle Share
    id: 17, 
    name:         "CoGo", 
    url:          '/realtime/pbsbikes?source_id=17&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://www.cogobikeshare.com/stations/json/',
    dataparser:   'pbsbikes_json',
    transit_type: ST_BIKE
 },
 { #Apsen Bicycle Share
    id: 18, 
    name:         "We-Cycle", 
    url:          '/realtime/pbsbikes?source_id=18&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://www.we-cycle.org/pbsc/stations.php/',
    dataparser:   'pbsbikes_json',
    transit_type: ST_BIKE
 },
 { #Bcycle Bicycle Share (covers _many_ cities) TODO: Give this its own parser at some point
    id: 19, 
    name:         "Bcycle", 
    url:          '/realtime/bcycle?source_id=19&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'http://api.bcycle.com/services/mobile.svc/ListKiosks',
    dataparser:   'bcycle',
    transit_type: ST_BIKE
 },
 { #Montreal Bike Share
    id: 20, 
    name:         "BixiMontreal", 
    url:          '/realtime/pbsbikes?source_id=20&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://montreal.bixi.com/data/bikeStations.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE 
 },
 { #London, UK Bike Share
    id: 21, 
    name:         "BarclaysCycleHire", 
    url:          '/realtime/pbsbikes?source_id=21&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE 
 },
 { #Ottawa, ON, Canada Bike Share
    id: 22, 
    name:         "CapitalBixi", 
    url:          '/realtime/pbsbikes?source_id=22&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://capital.bixi.com/data/bikeStations.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE 
 },
 { #Toronto, ON, Canada Bike Share
    id: 23, 
    name:         "BixiToronto", 
    url:          '/realtime/pbsbikes?source_id=23&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://toronto.bixi.com/data/bikeStations.xml',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE 
 },
 { #Melbourne, Australia Bike Share
    id: 24, 
    name:         "MelbourneBikeShare", 
    url:          '/realtime/pbsbikes?source_id=24&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'http://www.melbournebikeshare.com.au/stationmap/data',
    dataparser:   'pbsbikes_xml',
    transit_type: ST_BIKE 
 },
 { #Melbourne, Australia Bike Share
    id: 25, 
    name:         "CycloCity", 
    url:          '/realtime/pbsbikes?source_id=25&stop_id={contract}/{stop_id}&format=json&parser=pbsbikes',
    stopdata:     'https://api.jcdecaux.com/vls/v1/contracts?apiKey=6a532d98e0ec45b44c8007d1d342d3abd44ecfcc',
    dataparser:   'cyclocity',
    transit_type: ST_BIKE 
 },
 { #Vienna, Austria City Bike Share
    id: 26, 
    name:         "CitybikeWien", 
    url:          '/realtime/pbsbikes?source_id=26&stop_id={stop_id}&format=json&parser=pbsbikes',
    stopdata:     'http://dynamisch.citybikewien.at/citybike_xml.php',
    dataparser:   'gewista_citybike',
    transit_type: ST_BIKE 
 }
].each do |source|
  Source.find_or_create_by_name(
    id:           source[:id], 
    name:         source[:name], 
    realtime_url: source[:url],
    stopdata:     source[:stopdata],
    dataparser:   source[:dataparser],
    transit_type: source[:transit_type]
  )
end