/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var center;
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

function got_coordinates(position) {
  center={'lat':position.coords.latitude, 'lon':position.coords.longitude};

  EventBus.trigger("center_map", position.coords.latitude, position.coords.longitude);

  ga('send', 'event', 'geolocations', 'got_coordinates', 'latlon', center.lat.toString() + "," + center.lon.toString() );

  $("#outside").hide();
  if(!(44.47<=center.lat && center.lat<=45.42 && -94.01<=center.lon && center.lon<=-92.73)){
    $("#outside").show();
    center.lat = 44.979971;
    center.lon = -93.269797;
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
    if(!HomeView.mobile){
      $(".stopbutton").mouseover(function(){EventBus.trigger("mouseover_stopbutton", $(this).data('stopid'));}).mouseleave(function(){EventBus.trigger("mouseleave_stopbutton", $(this).data('stopid'));});
    }
    update_table();
  });
}

function geocode(address){
  var geocoder = new google.maps.Geocoder();
  // from http://www.mngeo.state.mn.us/chouse/coordinates.html
  //These bounds are definitely large enough for the whole Twin Cities area
  var bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(44.47,-94.01),
    new google.maps.LatLng(45.42,-92.73)
  );
  geocoder.geocode({'address': address, 'bounds': bounds}, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK && results[0])
      got_coordinates({coords:{latitude:results[0].geometry.location.lat(), longitude:results[0].geometry.location.lng()}});
    else
      $("#table-results").html('<div class="alert alert-info">Failed to geocode address.</div>');
  });
}

function geocode_failure(){
  $("#table-results").html('<div class="alert alert-info">Failed to retrieve geolocation.</div>');
//  got_coordinates({coords:{latitude:44.980522382993826, longitude:-93.27006340026855}});
}

function update_coordinates(){
  var geosucc=setTimeout(geocode_failure,5000);

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function(pos){clearTimeout(geosucc);got_coordinates(pos);}, geocode_failure);
  else //TODO: Alert user that they cannot do geocoding
    geocode_failure();
}

$(document).ready(function() {
  if(!$(document).getUrlParam("q")){
    update_coordinates();
  } else {
    $("#q").val($(document).getUrlParam("q").replace(/\+/g," "));
    geocode($(document).getUrlParam("q"));
  }

  window.setInterval(update_table, 60000);

  $('.btn-current-location').on('click', update_coordinates);
  $("#q").on("keypress", function(e) { if (e.which == 13) geocode($("#q").val()); });
  $("#qsub").click(function() { geocode($("#q").val()); });
});
