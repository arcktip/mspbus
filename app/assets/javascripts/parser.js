var Parsers = {
  utils: {
    parseQueryString: function( url ) {
      var parser = document.createElement('a');
      parser.href = url;
      
      var params = {}, queries, temp, i, l;
   
      // Split into key/value pairs
      queries = parser.search.replace('?','').split("&");
   
      // Convert the array of strings into an object
      for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
      }
   
      return params;
    }
    // convertToEpoch: function() {
    //   var seconds = departure_time.substr(6,10);
    //   var offset = departure_time.substr(19,3);
    //   var arrtime = moment(seconds, "X");
    // }
  }
};

/*
|----------------------------------------------------------------------------------------------------
| NexTrip API
| Cities: Minneapolis
| Format: json
| Description: http://www.datafinder.org/metadata/NexTripAPI.html
|              https://github.com/r-barnes/mspbus/blob/master/doc/API-INFO.md
|----------------------------------------------------------------------------------------------------
*/

Parsers.nextrip = function(content) {
  
  var obj = [];

  for(var i = 0, len = content.length; i < len; i++) {
    obj.push({
      'DepartureText':  content[i].DepartureText,
      'DepartureTime':  content[i].DepartureTime.substr(6,10),
      'RouteDirection': content[i].RouteDirection,
      'Route':          content[i].Route,
      'Description':    content[i].Description,
      'Terminal':       content[i].Terminal
    });
  }


  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};

/*
|----------------------------------------------------------------------------------------------------
| Clever API
| Cities: Chicago
| Format: json
|----------------------------------------------------------------------------------------------------
*/
//TODO: Add route description

Parsers.clever = function(content) {
  var predictions = $(content).find('prd');
  var obj = [];

  for(var i = 0, len = predictions.length; i < len; i++) {
    
    var item = $(predictions[i]);
    
    // A - Arrivals, D - Departures.
    if( item.attr('typ') === 'A') {
      var est_time = item.attr('prdtm');
      var time_arr = est_time.split(' ');
      var first_date = time_arr[0];

      est_time = first_date.substr(0,4) + '-' + first_date.substr(4,2) + '-' + first_date.substr(6,2) + ' ' + time_arr[1];

      obj.push({
        'DepartureText': '',
        'DepartureTime': (new Date(est_time)).getTime() / 1000,
        'RouteDirection': item.attr('rtdir').toUpperCase(),
        'Route': item.attr('rt')
      });  
    }
  }

  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};

/*
|----------------------------------------------------------------------------------------------------
| Trimet API
| Cities: Portland
| Format: json
| Multiple: true
|----------------------------------------------------------------------------------------------------
*/
//TODO: Add route description

Parsers.trimet = function(content) {
  var obj = [],
      arrivals = content.resultSet.arrival,
      dir = content.resultSet.location.dir;

  for(var i = 0, len = arrivals.length; i < len; i++) {
    //console.log(arrivals[i].estimated);
    var arrival_time;

    if( arrivals[i].estimated ) {
      arrival_time = arrivals[i].estimated;
    } else {
      arrival_time = arrivals[i].scheduled;
    }

    obj.push({
      'DepartureText': '',
      'DepartureTime': (new Date(arrival_time)).getTime() / 1000,
      'RouteDirection': dir,
      'Route': arrivals[i].route
    });
  }

  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }
  return data;
}

/*
|----------------------------------------------------------------------------------------------------
| WMATA API
| Cities: Washington DC
| Format: json
|----------------------------------------------------------------------------------------------------
*/
//TODO: Add route description

Parsers.wmata = function(content) {
  var obj = [],
      arrivals = content.Predictions;

  for(var i = 0, len = arrivals.length; i < len; i++) {
    obj.push({
      'DepartureText': '',
      'DepartureTime': new Date( (new Date() ).getTime() + arrivals[i].Minutes * 60000) / 1000,
      'RouteDirection': arrivals[i].DirectionNum,
      'Route': arrivals[i].RouteID
    });
  }

  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }
  return data;
}

/*
|----------------------------------------------------------------------------------------------------
| NextBus API
| Cities: UMN Campus Connector
| Format: xml
|----------------------------------------------------------------------------------------------------
*/
//TODO: Add route description

Parsers.nextbus = function(content) {
  var predictions = $(content).find('prediction');

  var obj = [];

  for(var i = 0, len = predictions.length; i < len; i++) {

    var item = $(predictions[i]);
    var dText;
    var dirTag    = item.attr('dirTag').toUpperCase();
    var routeName = item.parent().parent().attr('routeTag');
    var routeDesc = item.parent().parent().attr('routeTitle');

    if(routeName=='connector')
      routeName='CC';
    else if (routeName=='eastbank')
      routeName='EBC';
    else if (routeName=='stpaul')
      routeName='StPC';

    /*
    <route tag="bdda" title="BDD Shuttle A"/>    Academic Health Care Shuttle
    <route tag="bddb" title="BDD Shuttle B"/>    Academic Health Care Shuttle
    <route tag="connector" title="Campus Connector"/>
    <route tag="eastbank" title="East Bank Circulator" shortTitle="East Bank"/>
    <route tag="stpaul" title="St Paul Circulator" shortTitle="St Paul"/>
    */

    if (item.attr('minutes') === 0) {
      dText = 'Due';
    } else {
      dText =  item.attr('minutes') + ' min';
    }


    if ( dirTag !== 'LOOP' ) {
      dirTag = dirTag + 'BOUND';
    }
    // var epoc = (item.attr('epochTime') - (new Date).getTime() ) / 1000 / 60;

    //     console.log(' NextBUs :: ', epoc);
    obj.push({
      'DepartureText': '',
      'DepartureTime':  item.attr('epochTime') / 1000,
      'RouteDirection': dirTag,
      'Route':          routeName,
      'Description':    routeDesc
    });
  }
  
  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};

/*
|----------------------------------------------------------------------------------------------------
| NiceRide API
| Cities: Minneapolis
| Format: json
|----------------------------------------------------------------------------------------------------
*/

Parsers.mn_niceride = function(content) {
  var data = {
    template: 'nice_ride_template',
    content: content
  }

  return data;
};

/*
|----------------------------------------------------------------------------------------------------
| Car2Go API
| Cities: Many Cities
| Format: json
|----------------------------------------------------------------------------------------------------
*/

Parsers.car2go = function(content) {
  var data = {
    template: 'car2go_template',
    content: content
  }

  return data;
};






/*
|----------------------------------------------------------------------------------------------------
| Amtrak
| Cities: Amtrak
| Format: json
| Description: None, Richard & Louis built this from the ground up, yo.
|----------------------------------------------------------------------------------------------------
*/

Parsers.amtrak = function(content) {
  
  var obj = [];

  for(var i = 0, len = content.length; i < len; i++) {
    obj.push({
      'DepartureText':  content[i].DepartureText,
      'DepartureTime':  content[i].DepartureTime,
      'RouteDirection': content[i].RouteDirection,
      'Route':          content[i].Route+"<sup>"+content[i].TimeType+"</sup>",
      'Description':    content[i].Description,
    });
  }


  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};

/*
|----------------------------------------------------------------------------------------------------
| LA Metro
| Cities: Los Angeles
| Format: json
| Description: None, Louis built this from the ground up, yo yo.
|----------------------------------------------------------------------------------------------------
*/

/*

JSON Format:

block_id: "4601000"
is_departing: false
minutes: 3
route_id: "460"
run_id: "460_124_0"
seconds: 18
*/

Parsers.lametro = function(content) {
  
  var obj = [];

  items=content.items

  for(var i = 0, len = items.length; i < len; i++) {
    obj.push({
      'DepartureText':  items[i].minutes + " Min",
      'DepartureTime':  ((new Date).getTime()/1000)+(items[i].minutes*60),
      'RouteDirection': "",
      'Route':          "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+items[i].route_id,
      'Description':    items[i].route_id,
    });
  }
  
  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};
