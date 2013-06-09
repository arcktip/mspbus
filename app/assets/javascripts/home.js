var HomeView = Backbone.View.extend({

  el: '.app-container',

  events: {
    "click #view-table-btn": "show_table",
    "click #view-map-btn": "show_map"
  },

  initialize: function() {

    // Cache selectors for other actions.
    this.viewchanger = this.$el.find('#viewchanger');
    this.views = this.$el.find('.views');
    this.view_table = this.$el.find('#view-table');
    this.view_map = this.$el.find('#view-map');
    this.table_list_item = this.$el.find('#table-list-item');
    this.map_list_item = this.$el.find('#map-list-item');

    // We are on a small screen, should determine view to show.
    if ( matchMedia('only screen and (max-width: 767px)').matches ) {
      this.determine_view();
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

    initialize(center.lat, center.lon);
    add_markers(stops);
    initialize.ran=true;
    google.maps.event.trigger(map, "resize");
    $.cookie('home_current_view', 'map_list_item');
  }


});

$(window).resize(function() {
  google.maps.event.trigger(map, "resize");
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
});

$(document).ready(function() {

  var home_view = new HomeView();

  if( $('#view-map').css('display') !== 'none' ) {
    initialize(center.lat, center.lon);
    add_markers(stops);
    initialize.ran=true;
  }
});
