var config = {
  //Default center of the map if geolocation is outside bounds
  default_center: {lat:44.980522382993826, lon:-93.27006340026855},

  transit_mode_icons: {
    1: {
      icon:'/assets/bus-icon.svg',
      hover:'/assets/bus-icon-hover.svg'
    },
    2: {
      icon:'/assets/bike_station.png',
      hover:'/assets/bike_station_hover.png',
      no_bikes:'/assets/bike_station_empty.png',
      full: '/assets/bike_station_full.png'
    },
    3: {
      icon: '/assets/car.png',
      hover: '/assets/car.png'
    },
    4: {
      icon:'/assets/train-icon.svg',
      hover:'/assets/train-icon-hover.svg'
    }
  },
  icons: {
    YOU_ARE_HERE: '/assets/you-are-here.png'
  },
  csrfToken: $("meta[name='csrf-token']").attr('content')
};

// Override Backbone.sync to add CSRF-TOKEN HEADER
Backbone.sync = (function(original) {
  return function(method, model, options) {
    options.beforeSend = function(xhr) {
      if ( !model.format ) {
        xhr.setRequestHeader('X-CSRF-Token', config.csrfToken);
      } else {
        options.dataType = model.format;
      }
    };
    original(method, model, options);
  };
})(Backbone.sync);
