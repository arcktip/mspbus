// Realtime Template
var realtime_template = _.template('<% _.each(data, function(item) { %> <tr style="background: <%= item.priority %>"><td class="route" nowrap><i class="<%= item.direction %>"></i> <%= item.Route %><%= item.Terminal %></td><td><span class="desc" title="<%= item.Description %>"><%= item.sdesc %></span></td><td class="time"><i><%= item.StopText %></i> </td></tr><% }); %>');

$(document).ready(function() {
  
  // Stop View
  var view = new StopView();
  view.update();
  
  // Favorites View
  var favoritesView = new FavortiesView();

  // Yelp View
  var yelpView = new YelpView();

  window.setInterval(view.update, 60000);

  $("#mapshow").click(function(){$("#mapmodal").modal('show');});
  $("#mapmodal").click(function(){$("#mapmodal").modal('hide');});
  $('#yelp-btn').on('click', function() {
    yelpView.fetch();
  });
});

/*
|----------------------------------------------------------------------------------------------------
| Yelp View
|----------------------------------------------------------------------------------------------------
*/

var YelpView = Backbone.View.extend({
  el: '.yelp-table',
  template: JST['templates/yelp_results'],

  initialize: function() {
    _.bindAll(this);
  },

  fetch: function() {
    $.ajax({
      dataType: 'json',
      url: "http://api.yelp.com/business_review_search?category=restaurants&lat=" + mapcenter.lat + "&long=" + mapcenter.lon + "&radius=10&limit=10&ywsid=GIxmrRLcqn3pRF9cjNoqOw&callback=?",
      success: this.render
    });
  },

  render: function(response) {
    this.$el.find('tbody').html( this.template({ data: response.businesses }) );
    $("#yelp").show();
  }

});

/*
|----------------------------------------------------------------------------------------------------
| FavoritesView
|----------------------------------------------------------------------------------------------------
*/

var FavortiesView = Backbone.View.extend({
  
  el: '#makefav',
  favs: null,

  initialize: function() {
    _.bindAll(this);
    this.favs = $.cookie("favs");
    
    if(typeof(this.favs) !== 'undefined' && this.favs.indexOf("," + stopid + "," )!=-1) {
      this.activate();
    }

    this.$el.on('click', this.togglefav);
  },

  activate: function() {
    this.$el.find('i').addClass('star-yellow');
  },

  deactivate: function() {
    this.$el.find('i').removeClass('star-yellow');
  },

  togglefav: function () {
    var favs = $.cookie("favs");
    
    if(typeof(this.favs) === 'undefined') {
      this.favs = ",";
    }

    if(this.favs.indexOf(","+stopid+",") !== -1 ) {
      this.favs = this.favs.replace(","+stopid+",",",");
      this.deactivate();
    } else {
      this.favs += stopid + ",";
      this.activate();
    }

    $.cookie("favs", this.favs, {expires: 20*365, path:'/'});
  }

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

    this.realtime_sources = this.$el.data('realtime');
    if ( this.realtime_sources ) {
        //console.log(this.realtime_sources.length);
      for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
        this['collection' + i] = new BusETACollection();
          
        var r_collection = this['collection' + i];
        r_collection.stop_id = this.realtime_sources[i].external_stop_id;
        r_collection.realtime_url = this.realtime_sources[i].external_stop_url;
        var query_options = Parsers.utils.parseQueryString( r_collection.realtime_url );

        r_collection.format = query_options.format;
        r_collection.parser = query_options.parser;
        r_collection.logo = query_options.logo;
      }

    }
  },

  render: function(collection) {

    // if ( this.collection.models.length === 0 ) {
    //   this.$el.parent().html("No buses found.");
    //   return;
    // }

    if( collection.length === 0 ) {
      //this.$el.parent().parent().hide();
    } else {
      this.$el.html(realtime_template({ logo: collection.logo , data: collection.toJSON() }));
    }
  },

  update: function() {
    var self = this;
    
    if ( this.realtime_sources ) {
      for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
          var realtime_collection = this['collection' + i];
        
          realtime_collection.fetch({ success: function(collection) {
            self.process_data(collection);
          } });
      }

      // this.collection.fetch({ success: function() {
      //   self.process_data();
      // } });
    }

  },

  process_data: function(collection, num_models) {
    collection.process_models(num_models);
    this.render(collection);
  },

  format_data: function() {
    var data = _.map(this.collection.toJSON(),
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
