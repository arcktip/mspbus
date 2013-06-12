// Realtime Template
var realtime_template = _.template('<% _.each(data, function(item) { %> <tr><td class="route" nowrap><i class="<%= item.direction %>"></i> <%= item.Route %><%= item.Terminal %></td><td><span class="desc" title="<%= item.Description %>"><%= item.sdesc %></span></td><td class="time" style="color:<%= item.priority %>"><i><%= item.DepartureText %></i> </td></tr><% }); %>');

$(document).ready(function() {
  var id=$("#thestop").data().attr;
  BusETA(id, got_data );
  
  // Callback on realtime model.
  function got_data(data) {
    if(data.length==0){
      $("#result").parent().html("No buses found.");   
    }

    data=_.map(data,
      function(obj) {
        obj=process_eta(obj);

        if(obj.DepartureText.indexOf(":")!=-1)
          obj.DepartureText=obj.arrtime.format("h:mma");

        if(obj.dtime<20 && obj.DepartureText.indexOf(":")!=-1)
          obj.DepartureText+='&nbsp;<i title="Bus scheduled, no real-time data available." class="icon-question-sign"></i>';

        obj.sdesc=obj.Description;
        if(obj.sdesc.length>20 && matchMedia('only screen and (max-width: 480px)').matches)
          obj.sdesc=obj.Description.substr(0,20)+" &hellip;";

        return obj;
      }
    );
    data=_.sortBy(data,function(obj) { return obj.arrtime; });
    data=_.filter(data,function(obj) {
      return obj.DepartureText=obj.DepartureText;
    });
    $("#result").html( realtime_template({ data: data }) );
  }
});
