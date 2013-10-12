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

//    this.directions_box = this.$el.find('.directions-box');
    this.directions_found_head    = this.$el.find('#directions-found-head');
    this.directions_found_results = this.$el.find('#directions-found');
    this.route_input = this.$el.find('.route-input');

    this.flip_directions_left_btn     = this.$el.find('#flip-directions-left' );
    this.flip_directions_right_btn    = this.$el.find('#flip-directions-right');

    this.$el.on('click', '#flip-directions-left',  this.flip_directions_left);
    this.$el.on('click', '#flip-directions-right', this.flip_directions_right);

    //Richard: Temporarily disabled map centering until we get back to drawing on the map
//    this.directions_box.on('click', '.directions-step', this.center_map_on_step);

    this.origin           = this.$el.find('#origin');
    this.origin_container = this.$el.find('.origin-container');
    
    this.destination           = this.$el.find('#destination');
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
              origin     =new google.maps.LatLng(origin.lat, origin.lon);
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
      origin:       origin,
      destination:  destination,
      travelMode:   google.maps.TravelMode.TRANSIT,
      provideRouteAlternatives: true
      //TODO (from Richard): We may want to use "unitSystem:UnitSystem.METRIC" or "unitSystem:UnitSystem.IMPERIAL" in the future
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

  flip_directions_left:  function() {
    if(this.routes_max && this.route_displayed>1){
      this.route_displayed--;
      this.set_flip_buttons();
    }
  },

  flip_directions_right: function() {
    if(this.routes_max && this.route_displayed<this.routes_max){
      this.route_displayed++;
      this.set_flip_buttons();
    }
  },

  set_flip_buttons: function() {
    this.directions_found_results.children().hide();
    this.directions_found_results.children('.directions-box:nth-child('+this.route_displayed.toString()+')').show();

    if(this.route_displayed==this.routes_max)
      this.flip_directions_right_btn.removeClass('btn-info');
    else
      this.flip_directions_right_btn.addClass('btn-info');

    if(this.route_displayed==1)
      this.flip_directions_left_btn.removeClass('btn-info');
    else
      this.flip_directions_left_btn.addClass('btn-info');
  },

  display_route: function(data) {
    if ( data.routes ) {
      console.log(data);
      this.route_displayed=1;
      this.routes_max     =data.routes.length;

      for(var route=0;route<data.routes.length;route++){
        var box=$('<div class="directions-box"></div>').appendTo(this.directions_found_results);
        var leg   = data.routes[route].legs[0];
        var steps = leg.steps;
        box.html( this.direction_template({
          steps:                 steps,
          determine_travel_mode: this.determine_travel_mode,
          end_address:           this.destination.val()
        }) );
      }

      this.flip_directions_left_btn.removeClass('btn-info');
      this.directions_found_head.show();
      this.directions_found_results.show();
      this.directions_found_results.children('.directions-box:nth-child(1)').show();

/////////////////
//Richard: The code below draws the route on the map. I've temporarily disabled it.
/*
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
      }*/

//      got_coordinates(steps[0].start_point.lat(), steps[0].start_point.lng());

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
