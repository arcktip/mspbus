var config = {
  //Default center of the map if geolocation is outside bounds
  default_center: {lat:44.980522382993826, lon:-93.27006340026855},

  //Bounds of the map used to determine if geolocation is outside bounds
  //and to bias the address geocoding look-up
  bounds: {west:-94.01, east:-92.73, north:45.42, south:44.47},

  source_types: {
    '3': 'bike' //NiceRide
  },

  icons: {
    'bike': {icon:'/assets/bike_station.png', hover:'/assets/bike_station_hover.png', no_bikes:'/assets/bike_station_empty.png', full: '/assets/bike_station_full.png'},
    'bus':  {icon:'/assets/bus-icon.svg', hover:'/assets/bus-icon-hover.svg'}
  }
};
