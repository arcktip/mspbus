var center;
var geocenter;
window.EventBus = _.extend({},Backbone.Events);
var stops;
var my_bounds=false;

/*
|----------------------------------------------------------------------------------------------------
| Main DOM Ready
|----------------------------------------------------------------------------------------------------
*/

var views = {};

function update_table(){
  $(".real-time").each(function(index, item) {
    views[item.id] = new RealTimeView({ el: item });
    views[item.id].update();
  });
}

/*
displace_latlon(lat, lon, dist, angle)

Given a central (latitude, longitude) pair, an offset (in miles), and a bearing
angle (in degrees), this returns the {lat:XXX, lon:XXX} object of the point
defined by this information.
*/
function displace_latlon(lat1, lon1, d, brng){
  //Convert lat & lon & bearing angle (brng) to radians
  lat1*=Math.PI/180;
  lon1*=Math.PI/180;
  brng*=Math.PI/180;
  R=    3959; //Radius of the Earth in miles
  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
              Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

  //Convert angles back to degrees
  lat2*=180/Math.PI;
  lon2*=180/Math.PI;
  return {lat:lat2, lon:lon2};
}

/*
construct_bounding_box(lat, lon, offset_miles)

Given a central (latitude, longitude) pair and an offset (in miles),
this returns an object of the form: {south:XXX, north:XXX, east:XXX, west: XXX}
which can be used to bias geocoding results, or for other nefarious purposes
*/
function construct_bounding_box(lat, lon, offset_miles){
  var dist  = offset_miles * 1609.344;
  var north = displace_latlon(lat,lon,dist,0  );
  var east  = displace_latlon(lat,lon,dist,90 );
  var south = displace_latlon(lat,lon,dist,180);
  var west  = displace_latlon(lat,lon,dist,270);
  return {north:north.lat, east:east.lng, south:south.lat, west:west.lat};
}

function got_coordinates(lat, lon) {
  center={'lat':lat, 'lon':lon};

  ga('send', 'event', 'location', 'coordinates', lat.toString() + "," +lon.toString());

//TODO (from Richard): I've hidden the code below as we'll have to find a new way of determining when a user is out of bounds
/*  $("#outside").hide();
  if(!(config.bounds.south<=lat && lat<=config.bounds.north && config.bounds.west<=lon && lon<=config.bounds.east)){
    $("#outside").show();
    setTimeout(function(){$("#outside").fadeOut();},5000);
    center = config.default_center;
  }*/

  EventBus.trigger("center_map", center.lat, center.lon);

  $.ajax({
    url: "/table",
    method: "post",
    data: {
      lat:center.lat,
      lon:center.lon
    },
  }).done(function(data){
    $("#table-results").html(data);
    update_table();
  });
}


function geocode(address, bounds){
  var dfd = $.Deferred();
  var geocoder = new google.maps.Geocoder();

  // If the user entered current location, let's use the current geocenter
  if ( address.toLowerCase() === 'current location' ) {
    // But if that location's out of bounds, let's use their center
    if(!(config.bounds.south<=geocenter.lat && geocenter.lat<=config.bounds.north && config.bounds.west<=geocenter.lon && geocenter.lon<=config.bounds.east)){
      $("#outside").show();
      setTimeout(function(){$("#outside").fadeOut();},5000);
      dfd.resolve(center);
    } else {
      dfd.resolve(geocenter);
    }
  } else {
    // Else, actually do a geocode.
    geocoder.geocode({'address': address, 'bounds': bounds}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK){
        if(results.length==1){ //One result, display it
          dfd.resolve({lat:results[0].geometry.location.lat(), lon:results[0].geometry.location.lng()});
        } else {               //Multiple results, prompt user to choose
          var ab=$("#ambiguitybuttons");
          for(var i=0;i<results.length;i++){
            ab.append('<div class="btn ambiguitybutton" data-lat="' + results[i].geometry.location.lat() + '" data-lon="' + results[i].geometry.location.lng() + '">' + results[i].formatted_address + '</div>');
          }
          $(".ambiguitybutton").click(function(){
            $("#ambiguity").modal('hide');
            ab.html("");
            dfd.resolve({lat:$(this).data("lat"), lon:$(this).data("lon")});
          });
          $("#ambiguity").modal("show");
        }
      } else {                 //No results, indicate failure
        $("#table-results").html('<div class="alert alert-info">Failed to geocode address.</div>');
        dfd.reject();
      }
    });
  }

  return dfd;
}

function address_search(address){
  ga('send', {'hitType': 'pageview', 'page': '/virtual/address_search.php?q='+encodeURI(address)});
  if(address.match(/^\s*\d{1,3}\s*\w?\s*$/)) {
  	$("#noroute").show();
  	setTimeout(function(){$("#noroute").fadeOut();},3000);
  	return;
  }
  if(address.replace(/\s/g,'').length==0){
    update_coordinates();
    return;
  }

  var bounds=construct_bounding_box(center.lat, center.lon, 30);

  var bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(bounds.south,bounds.west),
    new google.maps.LatLng(bounds.north,bounds.east)
  );

  $.when(
    geocode(address, bounds)
  ).done(function(gloc) {
    got_coordinates(gloc.lat, gloc.lon);
  });
}

function geocode_failure(){
  $("#table-results").html('<div class="alert alert-info">Failed to retrieve geolocation, using cached position.</div>');
  geocenter=$.cookie("geocenter");
  if(typeof(geocenter)!=="undefined"){
    geocenter=JSON.parse(geocenter);
    got_coordinates(geocenter.lat, geocenter.lon);
  }
}

function update_coordinates(){
  var geosucc=setTimeout(geocode_failure,5000);

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function(pos){
      clearTimeout(geosucc);
      geocenter={lat:pos.coords.latitude, lon:pos.coords.longitude};
      $.cookie("geocenter", JSON.stringify(geocenter));
      got_coordinates(pos.coords.latitude, pos.coords.longitude);
    }, geocode_failure);
  else //TODO: Alert user that they cannot do geocoding
    geocode_failure();
}

$(document).ready(function() {
  if(!$(document).getUrlParam("q")){
    update_coordinates();
  } else {
    $("#q").val(decodeURIComponent($(document).getUrlParam("q")));
    address_search(decodeURIComponent($(document).getUrlParam("q")));
  }
  
  var navbar_view = new NavbarView({ page: 'realtime' });

  window.setInterval(update_table, 60000);
});
