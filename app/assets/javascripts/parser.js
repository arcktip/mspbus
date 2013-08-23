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

Parsers.nextrip = function(content) {
  
  var obj = [];

  for(var i = 0, len = content.length; i < len; i++) {
    obj.push({
      'DepartureText': content[i].DepartureText,
      'DepartureTime': content[i].DepartureTime.substr(6,10),
      'RouteDirection': content[i].RouteDirection,
      'Route': content[i].Route
    });
  }


  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};

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

Parsers.nextbus = function(content) {
  var predictions = $(content).find('prediction');
  
  var obj = [];

  for(var i = 0, len = predictions.length; i < len; i++) {
    
    var item = $(predictions[i]);
    var dText;
    var dirTag = item.attr('dirTag').toUpperCase();

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
      'DepartureTime': item.attr('epochTime') / 1000,
      'RouteDirection': dirTag,
      'Route': item.parent().parent().attr('routeTag')
    });
  }
  console.log(obj);
  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: obj
  }

  return data;
};

Parsers.mn_niceride = function(content) {
  var data = {
    template: 'nice_ride_template',
    content: content
  }

  return data;
};