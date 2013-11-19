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
      zoomControlOptions: { position: google.maps.ControlPosition.LEFT_CENTER },
      streetViewControl: false
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
      icon: config.icons.YOU_ARE_HERE
    });

    //idle event fires once when the user stops panning/zooming
    google.maps.event.addListener( this.map, "idle", this.map_bounds_changed );

    this.route_input_view = new RouteInputView({ el: '#view-route', map_parent: this });

    //Precreate Marker Images
    this.icons = {
      1: { 
        normal: new google.maps.MarkerImage(config.transit_mode_icons[1].icon, null, null, null, new google.maps.Size(22,22)),
        hover: new google.maps.MarkerImage(config.transit_mode_icons[1].hover, null, null, null, new google.maps.Size(22,22))
      },
      2: {
        normal: new google.maps.MarkerImage(config.transit_mode_icons[2].icon),
        hover: new google.maps.MarkerImage(config.transit_mode_icons[2].hover)
      },
      3: {
        normal: new google.maps.MarkerImage(config.transit_mode_icons[3].icon, null, null, null, new google.maps.Size(30,30)),
        hover: new google.maps.MarkerImage(config.transit_mode_icons[3].hover, null, null, null, new google.maps.Size(30,30))
      },
      4: {
        normal: new google.maps.MarkerImage(config.transit_mode_icons[4].icon, null, null, null, new google.maps.Size(22,22)),
        hover: new google.maps.MarkerImage(config.transit_mode_icons[4].hover, null, null, null, new google.maps.Size(22,22))
      }
    }
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

    var stop_type=new_stop.stop_type;
    var icon = this.icons[stop_type];

    //Make a new marker
    console.log(new_stop);
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(new_stop.lat,new_stop.lon),
      map: this.map,
      draggable: false,
      icon: icon.normal,
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
        var data = '<a class="marker-header clearfix" href="/stop/'  + new_stop.stop_url + '">' + view.$el.data('name') + '</a><br>';
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

    if(!HomeView.mobile) {  //TODO: Is this attached to the right place?
      google.maps.event.addListener(marker, 'mouseover', function() {
        this.setOptions({zIndex:10});
        this.setIcon( icon.hover );
        self.hover_on_marker(new_stop.id);
      });

      google.maps.event.addListener(marker, "mouseout", function() {
        self.mapElement.html("");
        this.setOptions({zIndex:this.get("myZIndex")});  
        this.setOptions({zIndex:1});
        this.setIcon( icon.normal );
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
