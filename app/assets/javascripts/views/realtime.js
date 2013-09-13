/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var RealTimeView = Backbone.View.extend({

  eta_template: JST['templates/eta_label'],
  nice_ride_template: JST['templates/nice_ride'],
  
  initialize: function(args) {
    _.bindAll(this);

    if ( args.map_stop ) {
      this.realtime_sources = args.map_stop.source_stops;
      this.$el=$('<span></span>');
      this.$el.data('name',args.map_stop.name);
      this.map_stop=true;
    } else {
      this.realtime_sources = this.$el.data('realtime');
      this.map_stop=false;
    }

    if ( this.realtime_sources ) {
      for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
        this['collection' + i] = new BusETACollection();
        
        var r_collection          = this['collection' + i];
        r_collection.stop_id      = this.realtime_sources[i].external_stop_id;
        r_collection.realtime_url = this.realtime_sources[i].external_stop_url;
        var query_options         = Parsers.utils.parseQueryString( r_collection.realtime_url );

        r_collection.format = query_options.format;
        r_collection.parser = query_options.parser;
        r_collection.logo   = query_options.logo;
       
        if ( !this.$el.find('.collection'+ r_collection.stop_id).length ) {
          this.$el.append('<div class="clearfix collection' + r_collection.stop_id + '"></div>');
        }
        
      }

    }

  },

  render: function(collection) {
    if ( collection.length === 0 && !this.map_stop ) {
      this.$el.parent().parent().hide(); //TODO: Should generalize this out of here
    } else {
      this.$el.find('.collection' + collection.stop_id ).html(this[collection.template]({ logo: collection.logo , data: collection.toJSON() }));
    }
  },

  update: function(callback, skip_fetch) {
    var self = this;

    if ( this.realtime_sources ) {
      for( var i=0, len=this.realtime_sources.length; i < len; i++ ) {
        var realtime_collection = this['collection' + i];
        
        if( !skip_fetch && realtime_collection.length === 0 ) {
          
          realtime_collection.fetch({ success: function(collection) {
            self.process_data(collection, 5);
            if(callback) { callback(); }
          } });
        } else {
          if(callback) { callback(); }
        }
      }
    }
    
  },

  process_data: function(collection, num_models) {   
    collection.process_models(num_models);
    this.render(collection);
  }
});