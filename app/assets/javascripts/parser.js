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
  }
};

Parsers.nextrip = function(content) {
  var data = {
    template: 'eta_template',
    callback: 'process_eta', 
    content: content
  }
  return data;
};

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
      dirTag = dirTag + 'BOUND'
    }
        
    obj.push({
      'DepartureText': dText,
      'DepartureTime': '/Date(' + item.attr('epochTime') + '-0500)/',
      'RouteDirection': dirTag,
      'Route': item.parent().parent().attr('routeTag')
    });
  }

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