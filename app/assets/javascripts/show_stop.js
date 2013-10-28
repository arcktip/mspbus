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
  // $('#yelp-btn').on('click', function() {
  //   yelpView.fetch();
  // });
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
  is_fav: false,

  initialize: function() {
    _.bindAll(this);
    this.model = new FavoriteModel({ id: stopid });
    this.model.fetch({ success: this.process_favorite });
  },

  process_favorite: function() {
    if ( this.model.hasChanged('stop_id') ) {      
      this.activate();
    } else {
      this.clear_model();
    }

    this.$el.on('click', this.togglefav);
  },

  activate: function() {
    this.is_fav = true;
    this.$el.find('i').addClass('star-yellow');
  },

  deactivate: function() {
    this.is_fav = false;
    this.$el.find('i').removeClass('star-yellow');
  },

  clear_model: function() {
    this.model.set('id', null);
    this.model.set('stop_id', stopid);
  },

  togglefav: function () {

    if ( this.is_fav ) {
      this.deactivate();
      this.model.set('id', stopid);
      this.model.destroy();
      this.clear_model();
    } else {
      this.activate();
      this.model.save();
    }

  }

});

/*
|----------------------------------------------------------------------------------------------------
| StopView
|----------------------------------------------------------------------------------------------------
*/

var StopView = Backbone.View.extend({

  el: '.result',
  template: JST['templates/show_stop_detail'],
  stop_list_template: JST['templates/stop_list'],
  flat_route_model: null,
  
  initialize: function() {
    _.bindAll(this);

    this.realtime_sources = this.$el.data('realtime');
    if ( this.realtime_sources ) {
      
      this.collection = new BusETACollection();  
      this.collection.stop_id      = this.realtime_sources.stop_id;
      this.collection.realtime_url = this.realtime_sources.url;
      this.collection.stop_type    = this.realtime_sources.stop_type;
      this.collection.source_id    = this.realtime_sources.source_id;

      var query_options = Parsers.utils.parseQueryString( this.collection.realtime_url );

      this.collection.format    = query_options.format;
      this.collection.parser    = query_options.parser;
      this.collection.logo      = query_options.logo;
    }

    this.$el.on('click', '.route-item', this.fetch_stop_list);
  },

  render: function(collection) {

    // if ( this.collection.models.length === 0 ) {
    //   this.$el.parent().html("No buses found.");
    //   return;
    // }

    if( collection.length === 0 ) {
      //this.$el.parent().parent().hide();
    } else if ( collection.stop_type === 2 ) {
      var formatted = this.format_niceride_data(collection);
      
      $('#niceride-disp .rental-status').html(formatted.bikes + " bikes, " + formatted.empty + " empty docks");
      $('#niceride-disp').show();
      $('.stop-table').hide();

    } else {
      var formatted=this.format_data(collection);
      this.$el.html(this.template({ logo: collection.logo , data: formatted }));
    }
  },

  update: function() {
    var self = this;
    
    if ( this.realtime_sources ) {
      this.collection.fetch({ success: function(collection) {
        self.process_data(collection);
      } });
      
      // this.collection.fetch({ success: function() {
      //   self.process_data();
      // } });
    }

  },

  process_data: function(collection, num_models) {
    collection.process_models(num_models);
    this.render(collection);
  },

  format_niceride_data: function(collection) {
    var data=collection.toJSON()[0];
    return {name:data.name, bikes:data.nbBikes, empty:data.nbEmptyDocks};
  },

  format_data: function(collection) {
    var data = _.map(collection.toJSON(),
      function(obj) {
//        if(obj.DepartureTime<20 && obj.DepartureText.indexOf(":")!=-1)
//          obj.DepartureText+='&nbsp;<i title="Bus scheduled, no real-time data available." class="icon-question-sign"></i>';

        obj.sdesc=obj.Description;
        if(obj.sdesc && obj.sdesc.length>20 && matchMedia('only screen and (max-width: 480px)').matches)
          obj.sdesc=obj.Description.substr(0,20)+" &hellip;";

        return obj;
      }
    );

    return data;
  },

  fetch_stop_list: function(e) {
    var $target = $(e.currentTarget || e.srcElement);

    this.flat_route_model = new FlatRouteModel({ id: $target.data('route') });
    this.flat_route_model.fetch({ success: this.show_stop_list });
  },

  show_stop_list: function(list) {
    $('#stop-table').find('tbody').html( this.stop_list_template({ data: list.toJSON(), lat: mapcenter.lat, lon: mapcenter.lon }) );
    $('#stop-list').modal('show');
  }  
});
