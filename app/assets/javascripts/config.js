var config = {
  //Default center of the map if geolocation is outside bounds
  default_center: {lat:44.980522382993826, lon:-93.27006340026855},

  //Bounds of the map used to determine if geolocation is outside bounds
  //and to bias the address geocoding look-up
  bounds: {west:-94.01, east:-92.73, north:45.42, south:44.47},

  //Assuming a system with only one transit provider, this formats the API
  //call to get the stop information based on the stopid
  //TODO: The API call functionality needs to be abstracted away from the
  //particulars of a given system
  api_url: function(stopid) { return 'http://svc.metrotransit.org/NexTrip/' + stopid + '?callback=?&format=json'; }
};
