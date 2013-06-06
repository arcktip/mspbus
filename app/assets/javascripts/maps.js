var map;
var map_markers=[];
var bus_markers=[];

function update_bus_locations(){
  _.each(bus_markers, function(bus) {
    bus.setMap(null);
  });
  bus_markers=[];

  var bus_list=[];

  _.each(map_markers, function(marker) {
    BusETA(marker.stopid, function(data) {
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
          stopid:marker.stopid
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
function add_markers(markers, stop_ids) {
  if (initialize.ran==true)
    return;

  var infobox = new google.maps.InfoWindow({
    size: new google.maps.Size(200, 50)
  });

  _.each(markers, function(item, index) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(item[1], item[0]),
      map: map,
      draggable: false,
      icon: '/assets/bus-stop.png',
      animation: google.maps.Animation.DROP,
      stopid:stop_ids[index]
    });
    map_markers.push(marker);
    google.maps.event.addListener(marker, 'click', function() { 
      BusETA(stop_ids[index], function(data) {
        data=process_eta_data(data);
        data+='<br><a href="/stop/'  + stop_ids[index] + '">Full stop info</a>';
        data='<div class="infocontents">'+data+'</div>';
        infobox.setContent(data);
        infobox.open(map,marker);
      });
    });
	  google.maps.event.addListener(marker, 'mouseover', function() {
      hover_on_marker(stop_ids[index]);
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
  });

  var yah_marker = new google.maps.Marker({
    position: new google.maps.LatLng(initialize.lat,initialize.lon),
    map: map,
    draggable: false,
    icon: '/assets/you-are-here.png',
    animation: google.maps.Animation.DROP
  });
}
