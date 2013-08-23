/*
|----------------------------------------------------------------------------------------------------
| BusETAModel
|----------------------------------------------------------------------------------------------------
*/

var BusETAModel = Backbone.Model.extend({

  initialize: function() {},

  set_dtext: function() {
    var dtime = this.get('dtime');
    var ChipText, StopText;

    if ( this.get('DepartureText') !== '' ) {
      ChipText = this.get('DepartureText');
    } else {
      console.log(dtime);
      ChipText = Math.round(dtime) + ' Min'
    }
    
    StopText = ChipText;

    // Check for the case where the time is acutally hh:mm
    if(dtime < 20 && ChipText.indexOf(":") !== -1) { //Ex: 4:10 (and it is now 4:00)
      ChipText = '&ndash; ' + Math.round(dtime) + ' Min <i title="Real-time data unavailable" class="icon-question-sign"></i>';
    } else if(dtime >= 20) {                         //Ex: 4:30 (and it is now 4:00)
      ChipText = '';
    } else {                                         //Ex: 12 min
      ChipText = '&ndash; ' + ChipText;
    }
    this.set('ChipText', ChipText);

    // Check for case when time is less than 1 and replace with NOW.
    if(dtime < 1) {
      StopText = "Now";
      if(StopText.indexOf(":") !== -1)
        StopText+=' Min <i title="Real-time data unavailable" class="icon-question-sign"></i>';
    } else if(dtime < 20 && StopText.indexOf(":") !== -1) { //Ex: 4:10 (and it is now 4:00)
      StopText = Math.round(dtime) + ' Min <i title="Real-time data unavailable" class="icon-question-sign"></i>';
    } else {                         //Ex: "4:30" (and it is now 4:00) or "12 min"
      StopText = StopText;
    }
    this.set('StopText', StopText);
  },
  
  set_direction_class: function() {
    var route = this.get('RouteDirection');
    
    if(route === 'SOUTHBOUND') {
      this.set('direction', 'icon-arrow-down');
    } else if(route === 'NORTHBOUND') {
      this.set('direction', 'icon-arrow-up');
    } else if(route === 'EASTBOUND') {
      this.set('direction', 'icon-arrow-right');
    } else if(route === 'WESTBOUND') {
      this.set('direction', 'icon-arrow-left');
    } else if(route === 'LOOP') {
      this.set('direction', 'icon-refresh');
    }
  },

  set_priority: function() {
    var eta = this.get('dtime');

    if(eta < 5)
      this.set('priority', "#b94a48");
    else if (eta < 12)
      this.set('priority', "#f89406");
    else if (eta < 20)
      this.set('priority', "#468847");
    else
      this.set('priority', "#3a87ad");
  
  },

  set_departure_text: function() {
    var departure_text = this.get('DepartureText');

    if(departure_text === 'Due') {
      this.set('DepartureText', 'Now')
    }

  },

  process_eta: function() {
    var departure_time = this.get('DepartureTime');
    
    //TODO: Does this work over midnight?
    //var arrtime = moment(departure_time, 'X');
    var dt = (new Date(departure_time * 1000) - (new Date).getTime() ) / 1000 / 60; //Convert to minutes
    
    //this.set('arrtime', arrtime);
    this.set('dtime', dt);
    this.set_priority();
    this.set_departure_text();
    this.set_direction_class();
    this.set_dtext();
  }

});

/*
|----------------------------------------------------------------------------------------------------
| BusETACollection
|----------------------------------------------------------------------------------------------------
*/

var BusETACollection = Backbone.Collection.extend({

  stop_id: null,
  model: BusETAModel,
  
  url: function() {
    return this.realtime_url;
  },

  process_models: function(num_models) {
    var self = this;

    // Process the times for sorting purposes.
    if ( this.callback ) {
      this.map(function(model) {
        model[self.callback]();
      });

      // Sort models by closest
      if ( this.models.length > 1 ) {
        this.models = this.sortBy(function(model) { return model.get('DepartureTime'); });
      }

      
      // Slice only the first five for display
      if ( num_models ) {
        this.models = this.models.slice(0,num_models);
      }
    }
  },

  fetch: function( options ) {
    options = options || {};
    options.dataType = this.format;

    Backbone.Collection.prototype.fetch.call(this, options);
  },

  parse: function( response ) {
    var resp = Parsers[this.parser](response);
    
    this.template = resp.template;
    this.callback = resp.callback;

    return resp.content;
  }

});

// BusETACollection.comparator = function(bus_eta) {
//   return bus_eta.get('arrtime');
// };
