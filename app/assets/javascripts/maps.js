var map;
var bus_markers=[];

var infobox = new google.maps.InfoWindow({
  size: new google.maps.Size(200, 50)
});

function update_bus_locations(){
  _.each(bus_markers, function(bus) {
    bus.setMap(null);
  });
  bus_markers=[];

  var bus_list=[];

  _.each(stops, function(stop) {
    BusETA(stop.id, function(data) {
      $("#" + stop.id).html(process_eta_data(data));
      _.each(data, function(obj) {
        if(obj.VehicleLongitude==0) return;

        var key=obj.VehicleLongitude.toString()+obj.VehicleLatitude.toString();

        if(_.contains(bus_list, key)) return;
        bus_list.push(key);

        var icon;
        if($.isNumeric(obj.Route))
          icon='/assets/bus.png';
        else
          icon='/assets/train.png';

        var bus = new google.maps.Marker({
          position: new google.maps.LatLng(obj.VehicleLatitude, obj.VehicleLongitude),
          map: map,
          draggable: false,
          icon: icon,
          animation: google.maps.Animation.DROP,
          stopid:stop.id,
          zIndex:0
        });
        bus_markers.push(bus);
	      google.maps.event.addListener(bus, 'mouseover', function() {
          $("#maptt").html('<span class="label">Bus #' + obj.Route + obj.Terminal + " " + obj.RouteDirection+'</span>');
	      });
	      // Hide tooltip on mouseout event.
	      google.maps.event.addListener(bus, 'mouseout', function() {
          $("#maptt").html("");
	      });
      });
    });
  });
}

function add_stop(new_stop){
  //Search stops array to see if an object for this stop is already present
  var look_up=false;
  for(i in stops){
    if( stops[i].id == new_stop.id ){
      look_up=i;
      break;
    }
  }

  //Does a marker for this stop already exist on the map?
  if(look_up!==false && typeof(stops[look_up].marker)!=='undefined')
    return; //Yes, it already has a marker. Don't make another!

  //Make a new marker
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(new_stop.lat,new_stop.lon),
    map: map,
    draggable: false,
    icon: '/assets/bus-stop.png',
    //animation: google.maps.Animation.DROP,
    stopid:new_stop.id,
    zIndex:1
  });

  google.maps.event.addListener(marker, 'click', function() { 
    BusETA(new_stop.id, function(data) {
      data=process_eta_data(data);
      data+='<br><a href="/stop/'  + new_stop.id + '">Full stop info</a>';
      data='<div class="infocontents">'+data+'</div>';
      infobox.setContent(data);
      infobox.open(map,marker);
    });
  });

  google.maps.event.addListener(marker, 'mouseover', function() {
    hover_on_marker(new_stop.id);
    this.setOptions({zIndex:10});
    this.setIcon("/assets/bus-stop-hover.png");
  });

  google.maps.event.addListener(marker, "mouseout", function() {  
    this.setOptions({zIndex:this.get("myZIndex")});  
    this.setOptions({zIndex:1});
    this.setIcon("/assets/bus-stop.png");
  });

  // Hide tooltip on mouseout event.
  google.maps.event.addListener(marker, 'mouseout', function() {
    $("#maptt").html("");
  });

  if(look_up) //Already present in stops array
    stops[look_up].marker=marker
  else {  //The stop is not in the array, so add it
    new_stop.marker=marker;
    stops.push(new_stop);
  }
}

function map_bounds_changed(){
  var bounds=map.getBounds();
  var ne=bounds.getNorthEast();
  var sw=bounds.getSouthWest();
  var boundsobj={n:ne.lat(),s:sw.lat(),e:ne.lng(),w:sw.lng()};

  //Clear all the stop markers which are not currently visible
  _.each(stops, function(stop, index) {
    if(typeof(stop.marker)!=='undefined' && !bounds.contains(stop.marker.getPosition())){
      google.maps.event.clearInstanceListeners(stop.marker);
      stop.marker.setMap(null);
      delete stops[index].marker;
    }
  });

  //Clear stops from the list which are not visible and not in the table
  stops=_.filter(stops, function(stop) { return stop.in_table || typeof(stop.marker)!=='undefined'; });

  //Get locations of stops which are visible
  $.get('/stop/bounds', boundsobj, function(data, textStatus, jqXHR) {
    _.each(data, function(obj) { add_stop(obj); });
  });
}

function initialize(lat,lon) {
  if (initialize.ran==true)
    return;

  initialize.lat=lat;
  initialize.lon=lon;

  console.log("Host location: " + window.location.host);

  var mapOptions = {
    center: new google.maps.LatLng(lat, lon),
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  window.setTimeout(update_bus_locations, 3000);
  window.setInterval(update_bus_locations, 60000);
}

function hover_on_marker(stopid) {
  BusETA(stopid, function(data) {
    data=process_eta_data(data);
    if(data.length!=0)
      $('#maptt').html(data);
    else
      $('#maptt').html('<span class="label" style="background-color:black">No Data</span>');
  });
}

//  google.maps.event.addDomListener(window, 'load', initialize);
function add_markers(stops) {
  if (initialize.ran==true)
    return;

  _.each(stops, function(stop) { add_stop(stop); });

  //idle event fires once when the user stops panning/zooming
  google.maps.event.addListener(map,"idle",map_bounds_changed);

  var yah_marker = new google.maps.Marker({
    position: new google.maps.LatLng(initialize.lat,initialize.lon),
    map: map,
    draggable: false,
    icon: '/assets/you-are-here.png'
    //,animation: google.maps.Animation.DROP
  });
}
