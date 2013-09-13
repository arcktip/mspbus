var center;
var geocenter;
window.EventBus = _.extend({},Backbone.Events);
var stops;

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

function got_coordinates(lat, lon) {
  center={'lat':lat, 'lon':lon};

  EventBus.trigger("center_map", lat, lon);

  ga('send', 'event', 'geolocations', 'got_coordinates', 'latlon', lat.toString() + "," + lon.toString() );

  $("#outside").hide();
  if(!(config.bounds.south<=lat && lat<=config.bounds.north && config.bounds.west<=lon && lon<=config.bounds.east)){
    $("#outside").show();
    setTimeout(function(){$("#outside").fadeOut();},5000);
    center = config.default_center;
  }

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
    dfd.resolve(geocenter);
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
  if(address.replace(/^\s*\d{1,3}\s*\w?\s*$/,'yep',1)=='yep'){
  	$("#noroute").show();
  	setTimeout(function(){$("#noroute").fadeOut();},3000);
  	return;
  }
  if(address.replace(/\s/g,'').length==0){
    update_coordinates();
    return;
  }

  var bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(config.bounds.south,config.bounds.west),
    new google.maps.LatLng(config.bounds.north,config.bounds.east)
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
