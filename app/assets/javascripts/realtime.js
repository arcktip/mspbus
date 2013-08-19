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
  
  initialize: function(args) {
    _.bindAll(this);
    //this.realtime_sources = this.$el.data('realtime');
    if ( args.id ) {
      this.id = args.id;
    } else {
      this.realtime_sources = this.$el.data('realtime');

      if ( this.realtime_sources ) {
        //console.log(this.realtime_sources.length);
        for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
          this['collection' + i] = new BusETACollection();
          
          var r_collection = this['collection' + i];
          r_collection.stop_id = this.realtime_sources[i].external_stop_id;
          r_collection.realtime_url = this.realtime_sources[i].external_stop_url;
          r_collection.logo = this.realtime_sources[i].logo;

          if ( !this.$el.find('.collection'+ r_collection.stop_id).length ) {
            this.$el.append('<div class="clearfix collection' + r_collection.stop_id + '"></div>');
          }
          
        }

      }
    }

    //this.collection = new BusETACollection();
    //this.collection.stop_id = this.el.id;
  },

  render: function(collection) {
    if( collection.length === 0 ) {
      //this.$el.parent().parent().hide();
    } else {
      console.log('Render :: ' + collection.stop_id);
      this.$el.find('.collection' + collection.stop_id ).html(this.template({ logo: collection.logo , data: collection.toJSON() }));
    }
  },

  update: function(callback, skip_fetch) {
    var self = this;
    
    // if( this.id ) {
    //   if ( this.realtime_sources ) {
    //     if( !skip_fetch && this.collection.length === 0 ) {
    //       this.collection.fetch({ success: function() {
    //         self.process_data(5);
    //         if(callback) { callback(); }
    //       } });
    //     } else {
    //       if(callback) { callback(); }
    //     }
    //   }
    // } else {
    //   for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
    //     if ( this.realtime_sources ) {
    //       if( !skip_fetch && this['collection1'].length === 0 ) {
    //         this['collection1'].fetch({ success: function() {
    //           self.process_data(5);
    //           if(callback) { callback(); }
    //         } });
    //       } else {
    //         if(callback) { callback(); }
    //       }
    //     }
    //   }
    // }

    if ( this.realtime_sources ) {
      for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
        var realtime_collection = this['collection' + i];
        
        if( !skip_fetch && realtime_collection.length === 0 ) {
          
          realtime_collection.fetch({ success: function(collection) {
            self.process_data(collection, 5);
            if(callback) { callback(); }
          } });
        } else {
          if(callback) { callback(); }
        }
      }
    }
    
  },

  process_data: function(collection, num_models) {   
    collection.process_models(num_models);
    this.render(collection);
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
    address_search(decodeURIComponent($(document).getUrlParam("q")));
  }
  
  var navbar_view = new NavbarView({ page: 'realtime' });

  window.setInterval(update_table, 60000);
});
