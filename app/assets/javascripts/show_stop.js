// Realtime Template
var realtime_template = _.template('<% _.each(data, function(item) { %> <tr><td class="route" nowrap><i class="<%= item.direction %>"></i> <%= item.Route %><%= item.Terminal %></td><td><span class="desc" title="<%= item.Description %>"><%= item.sdesc %></span></td><td class="time" style="color:<%= item.priority %>"><i><%= item.DepartureText %></i> </td></tr><% }); %>');

$(document).ready(function() {
  view = new StopView();
  view.update();
});

/*
|----------------------------------------------------------------------------------------------------
| StopView
|----------------------------------------------------------------------------------------------------
*/

var StopView = Backbone.View.extend({

  el: '.result',
  template: realtime_template,
  
  initialize: function() {
    _.bindAll(this);
    this.collection = new BusETACollection();
    this.collection.stop_id = this.el.id;
  },

  render: function() {

    if ( view.collection.models.length === 0 ) {
      this.$el.parent().html("No buses found.");
      return;
    }

    this.$el.html( realtime_template({ data: this.format_data() }) );

  },

  update: function() {
    var self = this;
    
    this.collection.fetch({ success: function() {
      self.process_data();
    } });

  },

  process_data: function(num_models) {
    this.collection.process_models(num_models);
    this.render();
  },

  format_data: function() {
    var data = _.map(view.collection.toJSON(),
      function(obj) {
        if(obj.dtime<20 && obj.DepartureText.indexOf(":")!=-1)
          obj.DepartureText+='&nbsp;<i title="Bus scheduled, no real-time data available." class="icon-question-sign"></i>';

        obj.sdesc=obj.Description;
        if(obj.sdesc.length>20 && matchMedia('only screen and (max-width: 480px)').matches)
          obj.sdesc=obj.Description.substr(0,20)+" &hellip;";

        return obj;
      }
    );

    return data;
  }
});