var HomeView = Backbone.View.extend({

  el: '.app-container',

  initialize: function() {
    _.bindAll(this);

    this.map_view = new MapView();

    $('#view-table-btn').on('click', this.show_table);
    $('#view-map-btn').on('click',   this.show_map);
    $('#view-route-btn').on('click', this.show_route);
    
    // Cache selectors for other actions.
    //this.viewchanger = this.$el.find('#viewchanger');
    this.views      = this.$el.find('.views');
    this.view_table = this.$el.find('#view-table');
    this.view_map   = this.$el.find('#view-map');
    this.view_route = this.$el.find('#view-route');

    this.table_list_item = this.$el.find('#table-list-item');
    this.map_list_item   = this.$el.find('#map-list-item');

    this.update_screen_size();

    // We are on a small screen, should determine view to show.
    if ( matchMedia('only screen and (max-width: 767px)').matches ) {
      HomeView.mobile=true; //TODO: Is this the right place to attach this?
      this.determine_view();
    } else {
      HomeView.mobile=false; //TODO: Is this the right place to attach this?
    }
    //   if( $('#view-map').css('display') !== 'none' ) {
    //     this.map_view.init();
    //     this.map_view.ran = true;
    //   }
    // }
  },

  determine_view: function() {
    if ( $.cookie('home_current_view') === 'map_list_item' ) {
      this.show_map();
    } else {
      this.show_table();
    }
  },

  show_table: function() {
    //this.viewchanger.find("li").removeClass("active");
    //this.table_list_item.addClass("active");

    this.view_map.hide();
    this.view_route.hide();
    this.view_table.show();
    $.cookie('home_current_view', 'table_list_item');
  },

  show_map: function() {
    //this.viewchanger.find("li").removeClass("active");
    //this.map_list_item.addClass("active");
    this.view_table.hide();
    this.view_map.show();

    this.map_view.init();
    this.map_view.ran = true;

    google.maps.event.trigger(this.map_view.map, "resize");
    $.cookie('home_current_view', 'map_list_item');
  },

  show_route: function(e) {
    
    // Only goto anchor link if on mobile screens
    if ( matchMedia('only screen and (min-width: 767px)').matches ) {
      e.preventDefault();
    }

    if(!this.view_route.is(":visible")){
      if($.cookie('home_current_view') !== 'map_list_item') {
        this.show_map();
      }

      this.view_route.show();
    } else
      this.view_route.hide();
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
    this.screen_width = screen.width;
    this.screen_height = screen.height;
  }

});

$(document).ready(function() {
  var home_view = new HomeView();
  $(window).resize( $.throttle( 100, home_view.resize_helper.bind(home_view) ) );
});
