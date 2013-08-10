var MapView = Backbone.View.extend({
  
  map: null,
  map_markers: [],
  bus_markers: [],
  infobox: null,
  ran: false,
  lat: 0,
  lon: 0,

  init: function() {
    _.bindAll(this);

    window.EventBus.on("center_map",this.center_map);
    window.EventBus.on("pan_map",this.center_map);
    window.EventBus.on("mouseover_stopbutton",this.mouseover_stopbutton);
    window.EventBus.on("mouseleave_stopbutton",this.mouseleave_stopbutton);

    if (this.ran === true)
      return;

//    $("#map-canvas").height($(document).height()-100);

    var mapcenter=center;
    if(!mapcenter)
      mapcenter=config.default_center;

    var map_options = {
      center: new google.maps.LatLng(mapcenter.lat, mapcenter.lon),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      panControl: false,
      mapTypeControl: false,
      zoomControlOptions: { position: google.maps.ControlPosition.LEFT_CENTER }
    };

    this.map = new google.maps.Map(document.getElementById("map-canvas"), map_options);

    //TODO: Strictly speaking, we should only eliminate the HUD in situations
    //where the client is either or slow or using taps instead of clicks (i.e.
    //cannot hover)
    if(!HomeView.mobile){  //TODO: Is this attached to the right place?
      var hud_div=document.createElement('div');
      hud_div.id='maptt';
      this.mapElement = $(hud_div);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(hud_div);
    }

    var polyOptions = {
      strokeColor: '#2ea1e2',
      strokeOpacity: 0.7,
      strokeWeight: 4.5
      // icons: [{
      //   icon: {
      //     path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      //     fillOpacity: 1,
      //     scale: 3
      //   },
      //   offset: '50px',
      //   repeat: '100px'
      // }]
    };

    // Set polyline options for map
    this.poly = new google.maps.Polyline(polyOptions);
    this.poly.setMap(this.map);

    // Setup directions renderer
    this.directions_display = new google.maps.DirectionsRenderer({ draggable: false });
    this.directions_display.setMap(this.map);

    // Set directions display for map
    this.directions_service = new google.maps.DirectionsService();

    $('div.gmnoprint').first().parent().append(this.mapElement);

    this.infobox = new google.maps.InfoWindow({
      size: new google.maps.Size(200, 50)
    });

    this.yah_marker = new google.maps.Marker({
      position: new google.maps.LatLng(mapcenter.lat, mapcenter.lon),
      map: this.map,
      draggable: false,
      icon: '/assets/you-are-here.png'
    });

    //idle event fires once when the user stops panning/zooming
    google.maps.event.addListener( this.map, "idle", this.map_bounds_changed );

    //window.setTimeout(this.update_bus_locations, 3000);
    //window.setInterval(this.update_bus_locations, 60000);
    this.route_input_view = new RouteInputView({ el: '#view-route', map_parent: this });
  },
  
  render: function() {

  },

  mouseover_stopbutton: function(id) {
    var look_up=false; //TODO: Fix stops array to eliminate these kinds of searches
    for(i in stops){
      if( stops[i].id == id ){
        look_up=i;
        break;
      }
    }
    if(look_up===false) return;

    marker=stops[look_up].marker;
    marker.setOptions({zIndex:10});
    marker.setIcon("/assets/bus-stop-hover.png");
  },

  mouseleave_stopbutton: function(id) {
    var look_up=false;
    for(i in stops){
      if( stops[i].id == id ){
        look_up=i;
        break;
      }
    }
    if(look_up===false) return;

    marker=stops[look_up].marker;
    marker.setOptions({zIndex:1});
    marker.setIcon("/assets/bus-stop.png");
  },

  center_map: function(lat, lon){
    var self=this;
    var center = new google.maps.LatLng(lat, lon);
    self.map.panTo(center);
    self.yah_marker.setPosition(center);
  },

  pan_map: function(lat, lon){
    var self=this;
    var center = new google.maps.LatLng(lat, lon);
    self.map.panTo(center);
  },

  create_bus_marker: function(stop_id, obj) {
    var icon, bus, self = this;

    if( $.isNumeric( obj.get('Route') ) )
      icon='/assets/bus.png';
    else
      icon='/assets/train.png';

    bus = new google.maps.Marker({
      position: new google.maps.LatLng( obj.VehicleLatitude, obj.VehicleLongitude ),
      map: this.map,
      draggable: false,
      icon: icon,
      animation: google.maps.Animation.DROP,
      stopid: stop_id,
      zIndex: 0
    });

    this.bus_markers.push(bus);

    google.maps.event.addListener(bus, 'mouseover', function() {
      self.mapElement.html('<span class="label">Bus #' + obj.Route + obj.Terminal + " " + obj.RouteDirection+'</span>');
    });
    
    // Hide tooltip on mouseout event.
    google.maps.event.addListener(bus, 'mouseout', function() {
      self.mapElement.html("");
    });
  },

  update_bus_locations: function() {
    this.clear_bus_markers();

    var bus_list = [],
        self = this;

    for(var i=0, len=stops.length; i < len; i++) {
      var stop = stops[i];
      var view = views[stop.id];
      if (view) {
        view.collection.each(function(model) {
          if(model.get('VehicleLongitude') === 0) return;
          
          self.create_bus_marker(stop.id, model);
        });
        view.update();
      }
    }

  },

  hover_on_marker: function(stopid) {
    var view = views[stopid], self = this;

    view.update(function() {
      if(view.collection.models.length !== 0)
        self.mapElement.html(view.$el.html());
      else
        self.mapElement.html('<span class="label route-chip" style="background-color:black">No Data</span>');
    });
  },

  add_stop: function(new_stop){
    
    //Search stops array to see if an object for this stop is already present
    var look_up=false, self = this;
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
      map: this.map,
      draggable: false,
      icon: '/assets/bus-stop.png',
      //animation: google.maps.Animation.DROP,
      stopid: new_stop.id,
      zIndex: 1
    });

    if (!views[new_stop.id]) {
      views[new_stop.id] = new RealTimeView({ id: new_stop.id });
      views[new_stop.id].$el.data('name', new_stop.name);
    }

    google.maps.event.addListener(marker, 'click', function() {
      
      var view = views[new_stop.id];
      view.update(function() {

        var data = '<a class="marker-header clearfix" href="/stop/'  + new_stop.id + '">' + view.$el.data('name') + '</a><br>';
        data += '<div class="clearfix">' + view.$el.html() + '</div>';
        data = '<div class="infocontents">'+data+'</div>';
        self.infobox.setContent(data);
        self.infobox.open(self.map, marker);
/*        $('.infocontents').on('click', '.route-chip', function() {
          // Refactor into new map.
          var route_id = $(this).data('route');
          self.get_closest_trip(new_stop.id, route_id);
          //self.mapElement.css({ 'height': '4em', 'background': 'rgba(0,0,0,0.6)'});
          //self.mapElement.html( JST['templates/map_hud']({ descr: $('<div></div>').append($(this).clone()).html() }) );
        });*/
      });
    });

    if(!HomeView.mobile){  //TODO: Is this attached to the right place?
      google.maps.event.addListener(marker, 'mouseover', function() {
        //self.mapElement.css({ 'height': '2em', 'background': 'rgba(0,0,0,0.3)'});
        self.hover_on_marker(new_stop.id);
        this.setOptions({zIndex:10});
        this.setIcon("/assets/bus-stop-hover.png");
        $(".stopbutton[data-stopid='" + new_stop.id + "']").css("background-color","#E6E6E6");
      });

      google.maps.event.addListener(marker, "mouseout", function() {
        self.mapElement.html("");
        this.setOptions({zIndex:this.get("myZIndex")});  
        this.setOptions({zIndex:1});
        this.setIcon("/assets/bus-stop.png");
        $(".stopbutton[data-stopid='" + new_stop.id + "']").css("background-color","");
      });
    }

    if(look_up) //Already present in stops array
      stops[look_up].marker=marker
    else {  //The stop is not in the array, so add it
      new_stop.marker=marker;
      stops.push(new_stop);
    }
  },

  get_closest_trip: function(stop_id, route_id) {
    var self = this;
    $.get('/stop/closest_trip', {stop_id: stop_id, route: route_id }, function(data, textStatus, jqXHR) {
      if(data) {
        self.set_path(data.encoded_polyline);
      }
    });
  },

  set_path: function(path) {
    var decodedSets = google.maps.geometry.encoding.decodePath(path); 
    this.poly.setPath(decodedSets);
    this.poly.setMap(this.map);
  },

  clear_path: function() {
    this.poly.setMap(null);
  },

  add_path: function(path) {
    var decodedSets = google.maps.geometry.encoding.decodePath(path);
    var path = this.poly.getPath();
    path.push(decodedSets);
  },

  clear_bus_markers: function() {
    _.each(this.bus_markers, function(bus) {
      bus.setMap(null);
    });
    this.bus_markers = [];
  },

  map_bounds_changed: function() {
    var bounds = this.map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var boundsobj = {n:ne.lat(),s:sw.lat(),e:ne.lng(),w:sw.lng()};
    var self = this;

    //Clear all the stop markers which are not currently visible
    _.each(stops, function(stop, index) {
      if(typeof(stop.marker)!=='undefined' && !bounds.contains(stop.marker.getPosition())){
        google.maps.event.clearInstanceListeners(stop.marker);
        stop.marker.setMap(null);
        delete stops[index].marker;
      }
    });

    //Clear stops from the list which are not visible and not in the table
    stops = _.filter(stops, function(stop) { return stop.in_table || typeof(stop.marker)!=='undefined'; });

    //Get locations of stops which are visible
    $.get('/stop/bounds', boundsobj, function(data, textStatus, jqXHR) {
      _.each(data, function(obj) { self.add_stop(obj); });
    });
  }

});

var RouteInputView = Backbone.View.extend({

  el: '#view-route',
  direction_template: JST['templates/directions'],
  direction_markers: [],

  initialize: function() {
    _.bindAll(this);

    // Set the map parent view.
    this.map_parent = arguments[0].map_parent;
    
    // Setup Route inpute events.
    this.$el.on('click', '#btn-route', this.process_route_parameters);
    this.$el.on('click', '.btn-route-back', this.show_route_input);
    this.$el.on('click', '.btn-hide-route', this.hide);
    this.$el.on('click', '.btn-exchange', this.exchange);
    this.$el.on('click', '.loc-arrow', this.set_current_location);

    this.directions_box = this.$el.find('.directions-box');
    this.route_input = this.$el.find('.route-input');
    this.directions_box.on('click', '.directions-step', this.center_map_on_step);

    this.origin = this.$el.find('#origin');
    this.origin_container = this.$el.find('.origin-container');
    
    this.destination = this.$el.find('#destination');
    this.destination_container = this.$el.find('.destination-container');
  },

  hide: function() {
    this.$el.hide();
  },

  exchange: function() {
    
    var origin = this.origin.val();
    var destination = this.destination.val();

    this.origin.val(destination);
    this.destination.val(origin);
  },

  set_current_location: function(e) {
    var input = $(e.currentTarget).data('input');
    if ( input === 'origin' ) {
      this.origin.val('Current Location');
    } else {
      this.destination.val('Current Location');
    }
  },
  
  clear_direction_markers: function() {
    _.each(this.direction_markers, function(marker) {
      marker.setMap(null);
    });
    this.direction_markers = [];
  },

  center_map_on_step: function(e) {
    var index = $(e.currentTarget).data('index');
    var location;

    if ( index < this.steps.length ) {
      location = this.steps[index].start_point;
    } else {
      location = this.end_location;    
    }

    EventBus.trigger("pan_map", location.lat(), location.lng());

    if ( matchMedia('only screen and (max-width: 767px)').matches ) {
      this.$el.hide();
    }
  },

  process_route_parameters: function() {

    var self = this;
    var origin, destination;
    var dfd = $.Deferred();

    var bounds = new google.maps.LatLngBounds(
      //These bounds are definitely large enough for the whole Twin Cities area
      new google.maps.LatLng(config.bounds.south,config.bounds.west),
      new google.maps.LatLng(config.bounds.north,config.bounds.east)
    );

    if ( this.validate_inputs() ) {
      geocode(self.origin.val(), bounds).then(
        function(origin){
          geocode(self.destination.val(), bounds).done(
            function(destination) {
              origin=new google.maps.LatLng(origin.lat, origin.lon);
              destination=new google.maps.LatLng(destination.lat, destination.lon);
              self.calculate_route(origin, destination, self.display_route);
            }
          )
        }
      );
    }

  },

  validate_inputs: function() {

    var ok = true;
    
    if ( this.origin.val() === "" ) {
      this.origin_container.addClass("error");
      ok = false;
    } else {
      this.origin_container.removeClass("error");
    }

    if ( this.destination.val() === "" ) {
      this.destination_container.addClass("error");
      ok = false;
    } else {
      this.destination_container.removeClass("error");
    }

    return ok;
  },

  calculate_route: function(origin, destination, callback) {
    var self = this;
    var request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.TRANSIT
    };

    window.location.hash = '#map-list-item';

    this.map_parent.directions_service.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        callback(response);
      } else {
        //console.log('Route Error: ');
        //self.display_route_error(status);
      }
    });

  },

  determine_travel_mode: function(mode) {
    if ( mode === "WALKING" ) {
      return 'directions-walk-icon';
    } else if ( mode === "TRANSIT" ) {
      return 'directions-transit-icon';
    } else if ( mode === "DRIVING" ) {
      return 'directions-driving-icon';
    }
  },

  display_route: function(route) {
    
    if ( route.routes ) {

      var legs = route.routes[0].legs[0];
      var steps = legs.steps;

      this.route_input.hide();
      this.directions_box.html( this.direction_template({
        steps: steps,
        determine_travel_mode: this.determine_travel_mode,
        end_address: this.destination.val()
      }) );
      
      this.directions_box.show();

      this.map_parent.set_path(route.routes[0].overview_polyline.points);
      //this.map_parent.directions_display.setDirections(route);
      this.steps = steps;
      this.end_location = legs.end_location;

      for ( var i=0, len=steps.length; i < len; i++ ) {
        var marker = new google.maps.Marker({
          position: steps[i].start_point,
          map: this.map_parent.map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'blue',
            fillOpacity: 1.0,
            scale: 6,
            strokeColor: 'white',
            strokeWeight: 4
          }
        });
        this.direction_markers.push(marker);
        //this.add_path(steps[i].polyline.points )
      }

      got_coordinates(steps[0].start_point.lat(), steps[0].start_point.lng());

    } else {
      // Error with routes.
    }
  },

  show_route_input: function () {
    this.route_input.show();
    this.directions_box.hide();

    this.clear_direction_markers();
    this.map_parent.clear_path();
  },

  display_route_error: function(status) {
    // Todo: Implement alert for routing error.
  },
});
