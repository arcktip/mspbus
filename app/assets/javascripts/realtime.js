/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var center;
var geocenter;
window.EventBus = _.extend({},Backbone.Events);
var stops;
var my_bounds=false;

var RealTimeView = Backbone.View.extend({

  eta_template: JST['templates/eta_label'],
  nice_ride_template: JST['templates/nice_ride'],
  
  initialize: function(args) {
    _.bindAll(this);

    if ( args.map_stop ) {
      this.realtime_sources = args.map_stop.source_stops;
      this.$el=$('<span></span>');
      this.$el.data('name',args.map_stop.name);
      this.map_stop=true;
    } else {
      this.realtime_sources = this.$el.data('realtime');
      this.loading_image=this.$el.find('.loadingimg');
      this.map_stop=false;
    }

    if ( this.realtime_sources ) {
      for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
        this['collection' + i] = new BusETACollection();
        
        var r_collection          = this['collection' + i];
        r_collection.stop_id      = this.realtime_sources[i].external_stop_id;
        r_collection.realtime_url = this.realtime_sources[i].external_stop_url;
        var query_options         = Parsers.utils.parseQueryString( r_collection.realtime_url );

        r_collection.format = query_options.format;
        r_collection.parser = query_options.parser;
        r_collection.logo   = query_options.logo;
       
        if ( !this.$el.find('.collection'+ r_collection.stop_id).length ) {
          this.$el.append('<div class="clearfix collection' + r_collection.stop_id + '"></div>');
        }
        
      }

    }

    //this.collection = new BusETACollection();
    //this.collection.stop_id = this.el.id;
  },

  render: function(collection) {
    if ( collection.length === 0 && !this.map_stop ) {
      this.$el.parent().parent().hide(); //TODO: Should generalize this out of here
    } else {
      this.$el.find('.collection' + collection.stop_id ).html(this[collection.template]({ logo: collection.logo , data: collection.toJSON() }));
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
            if(self.loading_image) self.loading_image.hide();
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
