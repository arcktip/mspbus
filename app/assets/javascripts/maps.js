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
          stopid:stop.id
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
  if(typeof(map_bounds_changed.timer)!=='undefined')
    clearTimeout(map_bounds_changed.timer);
  map_bounds_changed.timer = setTimeout(function() {
    var bounds=map.getBounds();
    var ne=bounds.getNorthEast();
    var sw=bounds.getSouthWest();
    var boundsobj={n:ne.lat(),s:sw.lat(),e:ne.lng(),w:sw.lng()};
    $.get('/stop/bounds', boundsobj, function(data, textStatus, jqXHR) {
      _.each(data, function(obj) { add_stop(obj); });
    });
  }, 200);
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
  if(typeof hover_on_marker.etas === 'undefined')
    hover_on_marker.etas={};

  if(typeof hover_on_marker.etas[stopid] === 'undefined'){
    if(!$("#" + stopid).length){
      BusETA(stopid, function(data) {
          data=process_eta_data(data);
          if(data.length!=0){
            hover_on_marker.etas[stopid]=data;
            $('#maptt').html(hover_on_marker.etas[stopid]);
          }
        }
      );
    } else {
      hover_on_marker.etas[stopid]=$("#" + stopid).html();
    }
  }

  $('#maptt').html(hover_on_marker.etas[stopid]);

//  $("#maptt").html($("#" + stopid).children().clone());
}

//  google.maps.event.addDomListener(window, 'load', initialize);
function add_markers(stops) {
  if (initialize.ran==true)
    return;

  _.each(stops, function(stop) { add_stop(stop); });

  google.maps.event.addListener(map,"bounds_changed",map_bounds_changed);

  var yah_marker = new google.maps.Marker({
    position: new google.maps.LatLng(initialize.lat,initialize.lon),
    map: map,
    draggable: false,
    icon: '/assets/you-are-here.png'
    //,animation: google.maps.Animation.DROP
  });
}
