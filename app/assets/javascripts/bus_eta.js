function BusETA(stopid, success) {
  var now=new Date().getTime()/1000;
  stopid=stopid.toString();

  //Check cache to see if we already have this
  if(typeof(BusETA.datas[stopid])!=='undefined' && now-BusETA.datas[stopid].ts<45)
    success(BusETA.datas[stopid].data);

  $.getJSON( 'http://svc.metrotransit.org/NexTrip/'+stopid+'?callback=?&format=json', '', 
    function(data, textStatus, jqXHR){
      BusETA.datas[stopid]={ts:now, data:data};
      success(data);
    }
  );
}
BusETA.datas={};


function get_direction_class(route) {
  if(route === 'SOUTHBOUND') {
    return 'icon-arrow-down';
  } else if(route === 'NORTHBOUND') {
    return 'icon-arrow-up';
  } else if(route === 'EASTBOUND') {
    return 'icon-arrow-right';
  } else if(route === 'WESTBOUND') {
    return 'icon-arrow-left';
  }
}

function get_priority(eta) {
  if(eta<5)
    return "#B94A48";
  else if (eta<15)
    return "#F89406";
  else if (eta<20)
    return "#468847";
  else
    return "#000080";
}

function process_eta(obj) {
  var seconds=obj.DepartureTime.substr(6,10);
  var offset=obj.DepartureTime.substr(19,3);

  obj.arrtime=moment(seconds, "X");
  var ctime=moment();

  obj.dtime=(obj.arrtime-ctime)/1000/60; //Convert to minutes

  obj.priority=get_priority(obj.dtime);

  if(obj.DepartureText=="Due")
    obj.DepartureText="Now";

  obj.direction = get_direction_class(obj.RouteDirection);

  return obj;
}
