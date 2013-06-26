var HomeView = Backbone.View.extend({

  el: '.app-container',

  events: {
    "click #view-table-btn": "show_table",
    "click #view-map-btn": "show_map"
  },

  initialize: function() {

    this.map_view = new MapView();
    
    // Cache selectors for other actions.
    this.viewchanger = this.$el.find('#viewchanger');
    this.views = this.$el.find('.views');
    this.view_table = this.$el.find('#view-table');
    this.view_map = this.$el.find('#view-map');
    this.table_list_item = this.$el.find('#table-list-item');
    this.map_list_item = this.$el.find('#map-list-item');

    this.update_screen_size();

    // We are on a small screen, should determine view to show.
    if ( matchMedia('only screen and (max-width: 767px)').matches ) {
      HomeView.mobile=true; //TODO: Is this the right place to attach this?
      this.determine_view();
    } else {
      HomeView.mobile=false; //TODO: Is this the right place to attach this?
      if( $('#view-map').css('display') !== 'none' ) {
        this.map_view.init(center);
        this.map_view.add_markers(stops);
        this.map_view.ran = true;
      }
    }
  },

  determine_view: function() {
    if ( $.cookie('home_current_view') === 'map_list_item' ) {
      this.show_map();
    } else {
      this.show_table();
    }
  },

  show_table: function() {
    this.viewchanger.find("li").removeClass("active");
    this.table_list_item.addClass("active");

    this.view_map.hide();
    this.view_table.show();
    $.cookie('home_current_view', 'table_list_item');
  },

  show_map: function() {
    this.viewchanger.find("li").removeClass("active");
    this.map_list_item.addClass("active");
    
    this.view_table.hide();
    this.view_map.show();

    this.map_view.init(center);
    this.map_view.add_markers(stops);
    this.map_view.ran = true;

    google.maps.event.trigger(this.map_view.map, "resize");
    $.cookie('home_current_view', 'map_list_item');
  },

  resize_helper: function() {
    google.maps.event.trigger(this.map_view.map, "resize");

    if (this.screen_width==screen.height && this.screen_height==screen.width){
      this.update_screen_size();
      return;
    }
    this.update_screen_size();

    if ( matchMedia('only screen and (max-width: 767px)').matches ){ //Small Screen
      $('#view-map').hide();
      $('#view-table').removeClass('span6');
      $('#view-table').addClass('span12');
      $('#view-map').removeClass('span6');
      $('#view-map').addClass('span12');
    } else {
      $('#view-map').show();
      $('#view-table').show();
      $('#view-table').removeClass('span12');
      $('#view-table').addClass('span6');
      $('#view-map').removeClass('span12');
      $('#view-map').addClass('span6');
    }
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
