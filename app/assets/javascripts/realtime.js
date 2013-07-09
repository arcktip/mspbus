/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var RealTimeView = Backbone.View.extend({

  template: _.template('<% _.each(data, function(item) { %><span class="label route-chip" style="background-color:<%= item.priority %>" data-route="<%= item.Route %>"><i class="<%= item.direction %>"></i> <b><%= item.Route %><%= item.Terminal %></b><span class="route-chip-italic"><%= item.ChipText %></span>  </span><% }); %>'),
  
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

$(document).ready(function() {

  // Loop over stops and get realtime data
  $(".real-time").each(function(index, item) {
    views[item.id] = new RealTimeView({ el: item });
    views[item.id].update();
  });

  window.setInterval(update_table, 60000);

  function got_coordiates(position) {
    $.cookie('lat', position.coords.latitude, { expires: 1 });
    $.cookie('lon', position.coords.longitude, { expires: 1 });

    window.location = '/';

    $.removeCookie('q');
    //window.location = '/?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude;
  }

  function error_on_coordinates() {
  	$('#ask').modal("hide");
  	$('#error').modal();
  }

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
      	error_on_coordinates();
      }
      event.target.submit();
    });
    return false;
  });

  $('.btn-current-location').on('click', function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(got_coordiates, error_on_coordinates);
    }else{
    	error_on_coordinates();
    }
  });

  if ( $.url().param('q') ){
    $.cookie('q', $.url().param('q'), { expires: 1 });
  }

  if ( !$.cookie('lat') && !$.url().param('q') ) {
    $('#ask').modal();
  }
});
