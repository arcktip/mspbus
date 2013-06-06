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
    add_markers(markers, stop_ids);
    initialize.ran=true;
  }
});
