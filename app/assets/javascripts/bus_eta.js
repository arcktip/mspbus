/*
|----------------------------------------------------------------------------------------------------
| BusETAModel
|----------------------------------------------------------------------------------------------------
*/

var BusETAModel = Backbone.Model.extend({

  initialize: function() {},

  set_dtext: function() {
    var dtime = this.get('dtime');
    var dtext = this.get('DepartureText');

    if(dtime < 20 && dtext.indexOf(":") !== -1) {
      dtext = '&ndash; ' + Math.round(dtime) + ' Min <i title="Bus scheduled, no real-time data available." class="icon-question-sign"></i>';
    } else if(dtime >= 20) {
      dtext = '';
    } else {
      dtext = '&ndash; ' + this.get('DepartureText');
    }
    this.set('dText', dtext);
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
      this.set('priority', "#ca5a41");
    else if (eta < 15)
      this.set('priority', "#cf842e");
    else if (eta < 20)
      this.set('priority', "#468847");
    else
      this.set('priority', "#4e7fb7");
  
  },

  set_departure_text: function() {
    var departure_text = this.get('DepartureText');

    if(departure_text === 'Due') {
      this.set('DepartureText', 'Now')
    }

  },

  process_eta: function() {
    var departure_time = this.get('DepartureTime');

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
    return 'http://svc.metrotransit.org/NexTrip/' + this.stop_id + '?callback=?&format=json';
  },

  initialize: function() {
    //this.stop_id = id;
  },

  process_models: function(num_models) {
    this.map(function(model) {
      model.process_eta();
    });
    this.sortBy(function(model) { return model.get('arrtime'); });

    if ( num_models ) {
      this.models = this.models.slice(0,num_models);
    }
  }

});

// BusETACollection.comparator = function(bus_eta) {
//   return bus_eta.get('arrtime');
// };