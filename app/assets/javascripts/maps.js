var MapView = Backbone.View.extend({
  
  map: null,
  map_markers: [],
  bus_markers: [],
  infobox: null,
  ran: false,
  lat: 0,
  lon: 0,

  init: function(coords) {
    _.bindAll(this);

    this.infobox = new google.maps.InfoWindow({
      size: new google.maps.Size(200, 50)
    });

    this.mapElement = $("#maptt");
    
    if (this.ran === true)
      return;

    this.lat = coords.lat;
    this.lon = coords.lon;

    var map_options = {
      center: new google.maps.LatLng(this.lat, this.lon),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(document.getElementById("map-canvas"), map_options);

    window.setTimeout(this.update_bus_locations, 3000);
    window.setInterval(this.update_bus_locations, 60000);
    
  },
  
  render: function() {

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

    self.bus_markers.push(bus);

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
      
      view.collection.each(function(model) {
        console.log(model);
        if(model.get('VehicleLongitude') === 0) return;
        
        self.create_bus_marker(stop.id, model);
      });
      view.update();
    }

  },

  hover_on_marker: function(stopid) {
    var view = views[stopid], self = this;
    console.log(view);
    view.update(function() {
      if(view.collection.models.length !== 0)
        self.mapElement.html(self.$el.html());
      else
        self.mapElement.html('<span class="label" style="background-color:black">No Data</span>');
    });
  },

  add_markers: function(stops) {
    if (this.ran === true)
      return;

    for(var i=0, len=stops.length; i < len; i++) {
      this.add_stop( stops[i] );
    }

    //idle event fires once when the user stops panning/zooming
    google.maps.event.addListener( this.map, "idle", this.map_bounds_changed );

    var yah_marker = new google.maps.Marker({
      position: new google.maps.LatLng(this.lat, this.lon),
      map: this.map,
      draggable: false,
      icon: '/assets/you-are-here.png'
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

    views[new_stop.id] = new RealTimeView({ id: new_stop.id });

    google.maps.event.addListener(marker, 'click', function() { 
      var view = views[new_stop.id];

      view.update(function() {
        var data = view.$el.html();

        data += '<br><a href="/stop/'  + new_stop.id + '">Full stop info</a>';
        data = '<div class="infocontents">'+data+'</div>';
        self.infobox.setContent(data);
        self.infobox.open(self.map, marker);
      });
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
      self.hover_on_marker(new_stop.id);
      this.setOptions({zIndex:10});
      this.setIcon("/assets/bus-stop-hover.png");
    });

    google.maps.event.addListener(marker, "mouseout", function() {  
      this.setOptions({zIndex:this.get("myZIndex")});  
      this.setOptions({zIndex:1});
      this.setIcon("/assets/bus-stop.png");
    });

    // Hide tooltip on mouseout event.
    google.maps.event.addListener(marker, 'mouseout', function() {
      self.mapElement.html("");
    });

    if(look_up) //Already present in stops array
      stops[look_up].marker=marker
    else {  //The stop is not in the array, so add it
      new_stop.marker=marker;
      stops.push(new_stop);
    }
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