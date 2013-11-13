/*
|----------------------------------------------------------------------------------------------------
| RealTimeView
|----------------------------------------------------------------------------------------------------
*/

var RealTimeView = Backbone.View.extend({

  eta_template: JST['templates/eta_label'],
  nice_ride_template: JST['templates/nice_ride'],
  car2go_template: JST['templates/car2go'],
  
  initialize: function(args) {
    _.bindAll(this);

    if ( args.map_stop ) {
      this.realtime_sources = JSON.parse(args.map_stop.realtime);
      this.$el=$('<span></span>');
      this.$el.data('name',args.map_stop.name);
      this.map_stop=true;
    } else {
      this.realtime_sources = this.$el.data('realtime');
      this.loading_image=this.$el.find('.loadingimg');
      this.map_stop=false;
    }

    if ( this.realtime_sources ) {
      
      this.collection = new BusETACollection();
      this.collection.stop_id      = this.realtime_sources.stop_id;
      this.collection.realtime_url = this.realtime_sources.url;
      this.collection.stop_type    = this.realtime_sources.stop_type;
      this.collection.source_id    = this.realtime_sources.source_id;
      var query_options         = Parsers.utils.parseQueryString( this.collection.realtime_url );

      this.collection.format = query_options.format;
      this.collection.parser = query_options.parser;
      this.collection.logo   = query_options.logo;
     
      if ( !this.$el.find('.collection'+ this.collection.stop_id).length ) {
        this.$el.append('<div class="clearfix collection' + this.collection.stop_id + '"></div>');
      }

    }

  },

  render: function(collection) {
    if ( collection.length === 0 && !this.map_stop ) {
      this.$el.parent().parent().hide(); //TODO: Should generalize this out of here
    } else {
      if(!this.map_stop) this.loading_image.hide();
      this.$el.find('.collection' + collection.stop_id ).html(this[collection.template]({ logo: collection.logo , data: collection.toJSON() }));
    }
  },

  update: function(callback, skip_fetch) {
    var self = this;

    if ( this.realtime_sources ) {
      if( !skip_fetch && this.collection.length === 0 ) {        
        this.collection.fetch({ success: function(collection) {
          self.process_data(collection, 5);
          if(callback) { callback(); }
        } });
      } else {
        if(callback) { callback(); }
      }
    }
    
  },

  process_data: function(collection, num_models) {   
    collection.process_models(num_models);
    this.render(collection);
  }
});