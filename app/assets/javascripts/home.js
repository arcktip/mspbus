var HomeView = Backbone.View.extend({

  el: '.app-container',

  current_view: null,
  current_view_btn: null,

  initialize: function() {
    _.bindAll(this);

    this.map_view = new MapView();
    
    // Views
    this.views      = this.$el.find('.views');
    this.view_table = this.$el.find('#view-table');
    this.view_map   = this.$el.find('#view-map');
    this.view_route = this.$el.find('#view-route');

    // Buttons
    this.view_table_btn = $('#view-table-btn');
    this.view_map_btn   = $('#view-map-btn');
    this.view_route_btn = $('#view-route-btn');

    // Events
    this.view_table_btn.on('click', this.show_table);
    this.view_map_btn.on  ('click', this.show_map);
    this.view_route_btn.on('click', this.show_route);

    // Tables
    this.table_list_item = this.$el.find('#table-list-item');
    this.map_list_item   = this.$el.find('#map-list-item');

    this.update_screen_size();

    // We are on a small screen, should determine view to show.
    if ( matchMedia('only screen and (max-width: 767px)').matches ) {
      HomeView.mobile=true; //TODO: Is this the right place to attach this?
    } else {
      HomeView.mobile=false; //TODO: Is this the right place to attach this?
    }

    this.determine_view();
  },

  determine_view: function() {
    var view_state;

    if ( location.hash.replace('#', '') )
      view_state=location.hash.replace('#', '');
    else
      view_state = $.cookie('home_current_view');

    if ( view_state === 'map_list_item' ) {
      this.show_map();
    } else if ( view_state === 'route_list_item') {
      this.show_route();
    } else {
      this.show_table();
    }
  },

  swap_view: function( view, view_btn, cookie_key ) {
    
    if ( this.current_view ) {
      this.current_view.hide();
      this.current_view_btn.removeClass('active');
    }

    this.current_view = view;
    this.current_view_btn = view_btn;
    
    view_btn.addClass('active');
    view.show();

    $.cookie('home_current_view', cookie_key);
  },

  init_map: function() {
    if ( !this.map_view.ran ) {
      this.map_view.init();
      this.map_view.ran = true;
    }
  },

  show_table: function() {
    this.swap_view( this.view_table, this.view_table_btn, 'table_list_item' );
  },

  show_map: function() {
    this.swap_view( this.view_map, this.view_map_btn, 'map_list_item' );
    this.init_map();
    google.maps.event.trigger(this.map_view.map, "resize");
  },

  show_route: function(e) {
    this.swap_view( this.view_route, this.view_route_btn, 'route_list_item' );
    this.init_map();
  },

  resize_helper: function() {
    google.maps.event.trigger(this.map_view.map, "resize");

    if (this.screen_width==screen.height && this.screen_height==screen.width){
      this.update_screen_size();
      return;
    }
    this.update_screen_size();

    //if ( matchMedia('only screen and (max-width: 767px)').matches ){ //Small Screen
      if($.cookie('home_current_view')==='map_list_item')
        $('#view-table').hide();
      else if ($.cookie('home_current_view')==='table_list_item')
        $('#view-map').hide();
  },

  update_screen_size: function() {
    this.screen_width  = screen.width;
    this.screen_height = screen.height;
  }

});

$(document).ready(function() {
  var home_view = new HomeView();
  $(window).resize( $.throttle( 100, home_view.resize_helper.bind(home_view) ) );
});
