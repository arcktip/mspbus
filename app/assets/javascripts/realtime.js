///////////////////////
//Generate ETA labels

var eta_label_template = _.template('<% _.each(data, function(item) { %> <span class="label" style="background-color:<%= item.priority %>"><i class="<%= item.direction %>"></i> <b><%= item.Route %><%= item.Terminal %></b> <i><%= item.dText %></i></span> <% }); %>');

// Callback on realtime model.
function process_eta_data(data) {
  if(data.length==0) {
    data="";
  } else {
    data=_.map(data,
      function(obj) {
        obj=process_eta(obj);

        if(obj.dtime<20 && obj.DepartureText.indexOf(":")!=-1)
          obj.dText='&ndash; ' + Math.round(obj.dtime)+' Min <i title="Bus scheduled, no real-time data available." class="icon-question-sign"></i>';
        else if(obj.dtime>=20)
          obj.dText='';
        else
          obj.dText='&ndash; ' + obj.DepartureText;

        return obj;
      }
    );

    data=_.sortBy(data,function(obj) { return obj.arrtime; });
    data=data.slice(0,5);
    data=eta_label_template({ data: data });
  }
  return data;
}



$(document).ready(function() {

  // Loop over stops and get realtime data
  $(".real-time").each(function(index, item) {
    BusETA(item.id, function(data) {
        data=process_eta_data(data);
        if(data.length==0)
          $("#" + item.id).parent().parent().hide();
        else
          $("#" + item.id).html(data);
      }
    );
  });
  

  function got_coordiates(position) {
    $.cookie('lat', position.coords.latitude, { expires: 1 });
    $.cookie('lon', position.coords.longitude, { expires: 1 });

    window.location = '/';

    $.removeCookie('q');
    //window.location = '/?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude;
  }

  function error_on_coordinates() {
  	$('#ask').modal("hide");
  	$('#error').modal();
  }

  // Setup location handlers
  $('.navbar-form').on('submit', function (event) {
    event.preventDefault();
    var form = $(this)
    var geocoder = new google.maps.Geocoder();
    // from http://www.mngeo.state.mn.us/chouse/coordinates.html
    var bounds = new google.maps.LatLngBounds(
      //These bounds are definitely large enough for the whole Twin Cities area
      new google.maps.LatLng(44.47,-94.01),
      new google.maps.LatLng(45.42,-92.73)
    );
    geocoder.geocode({'address': form.find('#q').val(), 'bounds': bounds}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK && results[0]) {
        $.cookie('lat', results[0].geometry.location.lat(), { expires: 1 });
        $.cookie('lon', results[0].geometry.location.lng(), { expires: 1 });
      }
      event.target.submit();
    });
    return false;
  });

  $('.btn-current-location').on('click', function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(got_coordiates, error_on_coordinates);
    }
  });

  if ( $.url().param('q') ){
    $.cookie('q', $.url().param('q'), { expires: 1 });
  }

  if ( !$.cookie('lat') && !$.url().param('q') ) {
    $('#ask').modal();
  }
});
