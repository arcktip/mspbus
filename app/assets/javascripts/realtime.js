/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var center;

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
  $.cookie('lat', position.coords.latitude, { expires: 1 });
  $.cookie('lon', position.coords.longitude, { expires: 1 });

  center={'lat':position.coords.latitude, 'lon':position.coords.longitude};

  EventBus.trigger("center_map", position.coords.latitude, position.coords.longitude);

  $.ajax({
    url: "/table",
    method: "post",
    data: {
      lat:position.coords.latitude,
      lon:position.coords.longitude
    },
  }).done(function(data){  $("#table-results").html(data); update_table(); });
}

$(document).ready(function() {

  if(!$(document).getUrlParam("q")){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(got_coordinates, function(){$("#table-results").html('<div class="alert alert-info">Failed to retrieve geolocation.</div>');});
    } else {
      //Error
    }
  } else {
    update_table();
  }

  window.setInterval(update_table, 60000);

  // Setup location handlers
  $('.navbar-form').on('submit', function (event) {
    event.preventDefault();
    var form = $(this)
    var geocoder = new google.maps.Geocoder();
    // from http://www.mngeo.state.mn.us/chouse/coordinates.html
    var bounds = new google.maps.LatLngBounds(
      //These bounds are definitely large enough for the whole Twin Cities area
      new google.maps.LatLng(44.47,-94.01),
      new google.maps.LatLng(45.42,-92.73)
    );
    geocoder.geocode({'address': form.find('#q').val(), 'bounds': bounds}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK && results[0]) {
        $.cookie('lat', results[0].geometry.location.lat(), { expires: 1 });
        $.cookie('lon', results[0].geometry.location.lng(), { expires: 1 });
      }else{
        //Error
      }
      event.target.submit();
    });
    return false;
  });

  $('.btn-current-location').on('click', function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(got_coordinates, function(){$("#table-results").html('<div class="alert alert-info">Failed to retrieve geolocation.</div>');});
    }else{
      //Error
    }
  });

  if ( $.url().param('q') ){
    $.cookie('q', $.url().param('q'), { expires: 1 });
  }
});
