/*
|----------------------------------------------------------------------------------------------------
| BusETAModel
|----------------------------------------------------------------------------------------------------
*/

var BusETAModel = Backbone.Model.extend({

  initialize: function() {},

  set_dtext: function() {
    var dtime = this.get('dtime');
    var ChipText = this.get('DepartureText');
    var StopText = this.get('DepartureText');

    if(dtime < 20 && ChipText.indexOf(":") !== -1) { //Ex: 4:10 (and it is now 4:00)
      ChipText = '&ndash; ' + Math.round(dtime) + ' Min <i title="Real-time data unavailable" class="icon-question-sign"></i>';
    } else if(dtime >= 20) {                         //Ex: 4:30 (and it is now 4:00)
      ChipText = '';
    } else {                                         //Ex: 12 min
      ChipText = '&ndash; ' + ChipText;
    }
    this.set('ChipText', ChipText);

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
    var seconds = departure_time.substr(6,10);
    var offset = departure_time.substr(19,3);
    var arrtime = moment(seconds, "X");
    var ctime = moment();
    var dtime = (arrtime - ctime ) / 1000 / 60; //Convert to minutes

    this.set('arrtime', arrtime);
    this.set('dtime', dtime);
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
    return config.api_url(this.stop_id);
  },

  process_models: function(num_models) {

    // Process the times for sorting purposes.
    this.map(function(model) {
      model.process_eta();
    });

    // Sort models by closest
    this.models = this.sortBy(function(model) { return model.get('arrtime'); });
    
    // Slice only the first five for display
    if ( num_models ) {
      this.models = this.models.slice(0,num_models);
    }
  }

});

// BusETACollection.comparator = function(bus_eta) {
//   return bus_eta.get('arrtime');
// };
