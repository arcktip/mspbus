$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

var MapView = Backbone.View.extend({
  
  map: null,
  map_markers: [],
  infobox: null,
  ran: false,
  lat: 0,
  lon: 0,

  init: function() {
    _.bindAll(this);

    window.EventBus.on("center_map",this.center_map);
    window.EventBus.on("pan_map",this.center_map);

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

    this.route_input_view = new RouteInputView({ el: '#view-route', map_parent: this });

    //Precreate Marker Images
    this.bus_normal_icon=new google.maps.MarkerImage(config.icons[1].icon, null, null, null, new google.maps.Size(22,22));
    this.bus_hover_icon =new google.maps.MarkerImage(config.icons[1].hover, null, null, null, new google.maps.Size(22,22));
    this.bike_normal_icon=new google.maps.MarkerImage(config.icons[2].icon);
    this.bike_hover_icon =new google.maps.MarkerImage(config.icons[2].hover);
  },
  
  render: function() {

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

  hover_on_marker: function(stopid) {
    var view = views[stopid], self = this;

    if(view.$el.html().length !== 0)
      self.mapElement.html(view.$el.html());
    else
      self.mapElement.html('<span class="label route-chip" style="background-color:black">No Data</span>');
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

    var stop_type=new_stop.source_stops[0].stop_type;
    var normal_icon='';
    var hover_icon=''
    if(stop_type==1){
      normal_icon=self.bus_normal_icon;
      hover_icon =self.bus_hover_icon;
    } else if(stop_type==2) {
      normal_icon=self.bike_normal_icon;
      hover_icon =self.bike_hover_icon;
    }

    //Make a new marker
    
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(new_stop.lat,new_stop.lon),
      map: this.map,
      draggable: false,
      icon: normal_icon,
      //animation: google.maps.Animation.DROP,
      stopid: new_stop.id,
      zIndex: 1
    });

    if (!views[new_stop.id]) {
      views[new_stop.id] = new RealTimeView({ map_stop: new_stop });
      views[new_stop.id].update();
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
        this.setOptions({zIndex:10});
        this.setIcon( hover_icon );
        self.hover_on_marker(new_stop.id);
      });

      google.maps.event.addListener(marker, "mouseout", function() {
        self.mapElement.html("");
        this.setOptions({zIndex:this.get("myZIndex")});  
        this.setOptions({zIndex:1});
        this.setIcon( normal_icon );
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
    //this.$el.on('click', '.btn-route-back', this.show_route_input);
    //this.$el.on('click', '.btn-hide-route', this.hide);
    this.$el.on('click', '.btn-exchange', this.exchange);
    this.$el.on('click', '.loc-arrow', this.set_current_location);

    this.directions_box = this.$el.find('.directions-box');
    this.route_input = this.$el.find('.route-input');
    this.directions_box.on('click', '.directions-step', this.center_map_on_step);

    this.origin = this.$el.find('#origin');
    this.origin_container = this.$el.find('.origin-container');
    
    this.destination = this.$el.find('#destination');
    this.destination_container = this.$el.find('.destination-container');
    
    $(this.destination).enterKey( this.process_route_parameters );
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

    //window.location.hash = '#map-list-item';

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

      this.directions_box.html( this.direction_template({
        steps: steps,
        determine_travel_mode: this.determine_travel_mode,
        end_address: this.destination.val()
      }) );
      
      this.directions_box.show();

      //this.map_parent.directions_display.setDirections(route);
      this.steps = steps;
      this.end_location = legs.end_location;

      for ( var i=0, len=steps.length; i < len; i++ ) {
        var pathcolour;
        if ( steps[i].travel_mode=="WALKING" )
          pathcolour="black";
        else
          pathcolour='#2ea1e2';

        var pathseg = new google.maps.Polyline(
          {strokeColor: pathcolour, strokeOpacity: 0.7, strokeWeight: 4.5}
        );
        pathseg.setPath(google.maps.geometry.encoding.decodePath(steps[i].polyline.points));
        pathseg.setMap(this.map_parent.map);
        this.direction_markers.push(pathseg);

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
      }

      got_coordinates(steps[0].start_point.lat(), steps[0].start_point.lng());

    } else {
      // Error with routes.
    }
  },

  show_route_input: function () {
    this.route_input.show();
    //this.directions_box.hide();

    this.clear_direction_markers();
    this.map_parent.clear_path();
  },

  display_route_error: function(status) {
    // Todo: Implement alert for routing error.
  },
});
