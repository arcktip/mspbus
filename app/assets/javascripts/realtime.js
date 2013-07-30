/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var center;
var geocenter;
window.EventBus = _.extend({},Backbone.Events);
var stops;

var RealTimeView = Backbone.View.extend({

  template: JST['templates/eta_label'],
  
  initialize: function() {
    _.bindAll(this);
    this.collection = new BusETACollection();
    this.collection.stop_id = this.el.id;
  },

  render: function() {
    if( this.collection.length === 0 ) {
      this.$el.parent().parent().hide();
    } else {
      this.$el.html(this.template({ data: this.collection.toJSON() }));
    }
  },

  update: function(callback, skip_fetch) {
    var self = this;
    
    if( !skip_fetch && this.collection.length === 0 ) {
      this.collection.fetch({ success: function() {
        self.process_data(5);
        if(callback) { callback(); }
      } });
    } else {
      if(callback) { callback(); }
    }
  },

  process_data: function(num_models) {
    this.collection.process_models(num_models);
    this.render();
  }
});

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
    center = config.default_center;
  }

  $.ajax({
    url: "/table",
    method: "post",
    data: {
      lat:lat,
      lon:lon
    },
  }).done(function(data){
    $("#table-results").html(data);
    if(!HomeView.mobile){
      $(".stopbutton").mouseover(function(){EventBus.trigger("mouseover_stopbutton", $(this).data('stopid'));}).mouseleave(function(){EventBus.trigger("mouseleave_stopbutton", $(this).data('stopid'));});
    }
    update_table();
  });
}


function geocode(address){
  var geocoder = new google.maps.Geocoder();
  var bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(config.bounds.south,config.bounds.west),
    new google.maps.LatLng(config.bounds.north,config.bounds.east)
  );
  geocoder.geocode({'address': address, 'bounds': bounds}, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK){
      if(results.length==1){ //One result, display it
        got_coordinates(results[0].geometry.location.lat(), results[0].geometry.location.lng());
      } else {               //Multiple results, prompt user to choose
        var ab=$("#ambiguitybuttons");
        for(var i=0;i<results.length;i++){
          ab.append('<div class="btn ambiguitybutton" data-lat="' + results[i].geometry.location.jb + '" data-lon="' + results[i].geometry.location.kb + '">' + results[i].formatted_address + '</div>');
        }
        $(".ambiguitybutton").click(function(){
          got_coordinates($(this).data("lat"), $(this).data("lon"));
          $("#ambiguity").modal('hide');
          ab.html("");
        });
        $("#ambiguity").modal("show");
      }
    } else {                 //No results, indicate failure
      $("#table-results").html('<div class="alert alert-info">Failed to geocode address.</div>');
    }
  });
}

function geocode_failure(){
  $("#table-results").html('<div class="alert alert-info">Failed to retrieve geolocation.</div>');
}

function update_coordinates(){
  var geosucc=setTimeout(geocode_failure,5000);

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function(pos){
      clearTimeout(geosucc);
      geocenter={lat:pos.coords.latitude, lon:pos.coords.longitude};
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
    geocode(decodeURIComponent($(document).getUrlParam("q")));
  }

  window.setInterval(update_table, 60000);

  $('.btn-current-location').on('click', update_coordinates);
  $("#q").on("keypress", function(e) { if (e.which == 13) geocode($("#q").val()); });
  $("#qsub").click(function() { geocode($("#q").val()); });
});
