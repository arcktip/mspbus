Minneapolis/St. Paul MetroTransit API Documentation
===================================================

There are two ways to get real-time arrival data. One can use either the global numeric **StopID** via `http://svc.metrotransit.org/NexTrip/{STOPID}` or the route's local alphanumeric **StopID** via `http://svc.metrotransit.org/NexTrip/{ROUTE}/{DIRECTION}/{STOP}`.

Real-time Arrival Data for a Stop
---------------------------------

http://svc.metrotransit.org/NexTrip/{STOPID}

**StopID** is a numeric identifier available from the GTFS information in **data/stops.txt**

Example call:

    http://svc.metrotransit.org/NexTrip/17976?format=json

Example output:

    [
        {
            "DepartureTime": "/Date(1370107440000-0500)/",
            "DepartureText": "Due",
            "Description": "24St-Uptown / Lake-France",
            "VehicleLongitude": -93.26514,
            "RouteDirection": "WESTBOUND",
            "Route": "17",
            "BlockNumber": 1180,
            "Terminal": "B",
            "Actual": true,
            "Gate": "",
            "VehicleLatitude": 44.9810355,
            "VehicleHeading": 0
        },
        {
          ....
          ....
        },
        ....
    ]

List of Routes Names, Descriptions, and Providers
-------------------------------------------------
http://svc.metrotransit.org/NexTrip/Routes

Example call:

    http://svc.metrotransit.org/NexTrip/Routes?format=json

Example output:

    [
        {
            "Route": "2",
            "ProviderID": "8",
            "Description": "2 - Franklin Av - Riverside Av - U of M - 8th St SE"
        },
        {
            "Route": "3",
            "ProviderID": "8",
            "Description": "3 - U of M - Como Av - Energy Park Dr - Maryland Av"
        },
        {
            "Route": "4",
            "ProviderID": "8",
            "Description": "4 - New Brighton - Johnson St - Bryant Av - Southtown"
        }
    ]

List of Directions for a Route
------------------------------
http://svc.metrotransit.org/NexTrip/Directions/{ROUTE}

Example call:

    http://svc.metrotransit.org/NexTrip/Directions/16?format=json

Example output:

    [
        {
            "Text": "EASTBOUND",
            "Value": "2"
        },
        {
            "Text": "WESTBOUND",
            "Value": "3"
        }
    ]

List of Providers
-----------------

http://svc.metrotransit.org/NexTrip/Providers

Example call:

    http://svc.metrotransit.org/NexTrip/Providers?format=json

Example output:

    [
        {
            "Text": "University of Minnesota",
            "Value": "1"
        },
        {
            "Text": "Airport (MAC)",
            "Value": "2"
        },
        {
            "Text": "Other",
            "Value": "3"
        },
        {
            "Text": "Prior Lake",
            "Value": "4"
        },
        {
            "Text": "Scott County",
            "Value": "5"
        }
    ]

List of Stops on a Route
------------------------

http://svc.metrotransit.org/NexTrip/Stops/{ROUTE}/{DIRECTION}

Example call (East bound stops):

    http://svc.metrotransit.org/NexTrip/Stops/16/2?format=json

Example output:

    [
        {
            "Text": "Ramp B/5th St  Transit Center",
            "Value": "5GAR"
        },
        {
            "Text": "4th St S  and Nicollet Mall",
            "Value": "4NIC"
        },
        {
            "Text": "Anderson Hall (U of M)",
            "Value": "ANHA"
        },
        {
            "Text": "Jones Hall and Eddy Hall (U of M)",
            "Value": "JOED"
        },
        {
            "Text": "University Ave and Ontario St",
            "Value": "OAUN"
        }
    ]

Information About A Stop
-------------------------

http://svc.metrotransit.org/NexTrip/{ROUTE}/{DIRECTION}/{STOP}

Example call (East bound stops):

    http://svc.metrotransit.org/NexTrip/16/2/ANHA

Example output:

    [
        {
            "DepartureTime": "/Date(1370109060000-0500)/",
            "DepartureText": "Due",
            "Description": "Univ Av / St Paul",
            "VehicleLongitude": -93.249402,
            "RouteDirection": "EASTBOUND",
            "Route": "16",
            "BlockNumber": 1172,
            "Terminal": "",
            "Actual": true,
            "Gate": "",
            "VehicleLatitude": 44.9717209,
            "VehicleHeading": 0
        },
        {
            "DepartureTime": "/Date(1370109420000-0500)/",
            "DepartureText": "7 Min",
            "Description": "Univ Av / St Paul",
            "VehicleLongitude": -93.2716287,
            "RouteDirection": "EASTBOUND",
            "Route": "16",
            "BlockNumber": 1168,
            "Terminal": "",
            "Actual": true,
            "Gate": "",
            "VehicleLatitude": 44.9804872,
            "VehicleHeading": 0
        },
        {
            "DepartureTime": "/Date(1370109960000-0500)/",
            "DepartureText": "16 Min",
            "Description": "Univ Av / St Paul",
            "VehicleLongitude": -93.271077,
            "RouteDirection": "EASTBOUND",
            "Route": "16",
            "BlockNumber": 1165,
            "Terminal": "",
            "Actual": true,
            "Gate": "",
            "VehicleLatitude": 44.9806579,
            "VehicleHeading": 0
        },
        {
            "DepartureTime": "/Date(1370110560000-0500)/",
            "DepartureText": "1:16",
            "Description": "Univ Av / St Paul",
            "VehicleLongitude": 0,
            "RouteDirection": "EASTBOUND",
            "Route": "16",
            "BlockNumber": 1169,
            "Terminal": "",
            "Actual": false,
            "Gate": "",
            "VehicleLatitude": 0,
            "VehicleHeading": 0
        },
        {
            "DepartureTime": "/Date(1370111160000-0500)/",
            "DepartureText": "1:26",
            "Description": "Univ Av / St Paul",
            "VehicleLongitude": 0,
            "RouteDirection": "EASTBOUND",
            "Route": "16",
            "BlockNumber": 1164,
            "Terminal": "",
            "Actual": false,
            "Gate": "",
            "VehicleLatitude": 0,
            "VehicleHeading": 0
        }
    ]

University of Minnesota Campus Connector API Documentation
==========================================================

Download full documentation from [here](http://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf).

Get Agency ID
-------------
First, we need to get the UMN **AgencyID**

    http://webservices.nextbus.com/service/publicXMLFeed?command=agencyList

The response _includes_:

    <agency tag="umn-twin" title="University of Minnesota" regionTitle="Minnesota"/>

Get A List of Routes
--------------------

Syntax:

    http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=<AGENCYID>

Example:

    http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=umn-twin

The response is:

    <body copyright="All data copyright University of Minnesota 2013.">
    <route tag="bdda" title="BDD Shuttle A"/>
    <route tag="bddb" title="BDD Shuttle B"/>
    <route tag="connector" title="Campus Connector"/>
    <route tag="eastbank" title="East Bank Circulator" shortTitle="East Bank"/>
    <route tag="stpaul" title="St Paul Circulator" shortTitle="St Paul"/>
    </body>

**tag** is a unique identifier for the route

Get Information About A Route
-----------------------------

Syntax:

    http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=<agency_tag>&r=<route tag>

Example:

    http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=umn-twin&r=connector

Response:

    <route tag="connector" title="Campus Connector" color="ff0000" oppositeColor="ffffff" latMin="44.9723784" latMax="44.9845009" lonMin="-93.2457576" lonMax="-93.1788092">
    <stop tag="willey" title="Willey Hall (West Bank)" lat="44.9723784" lon="-93.2446454" stopId="31"/>
    <stop tag="19th2nd" title="19th Avenue S & 2nd Street SE (West Bank)" shortTitle="19th S & 2nd SE (West Bank)" lat="44.9740532" lon="-93.2457576" stopId="34"/>
    <stop tag="sanford" title="Sanford Hall on University Avenue (East Bank)" shortTitle="Sanford Hall on University (East Bank)" lat="44.9808569" lon="-93.2400328" stopId="37"/>
    <stop tag="univplea" title="University Avenue & Pleasant Street SE (East Bank)" shortTitle="University & Pleasant SE (East Bank)" lat="44.979032" lon="-93.2354359" stopId="40"/>
    <stop tag="univrecc" title="University Avenue at Rec Center" shortTitle="University @ Rec Center" lat="44.9765626" lon="-93.2293284" stopId="43"/>
    <stop tag="stad23rd" title="TCF Bank Stadium & 23rd Avenue SE (East Bank)" shortTitle="TCF Bank Stadium & 23rd SE (East Bank)" lat="44.9767171" lon="-93.221742" stopId="46"/>
    <stop tag="trancomm_e" title="Transitway at Commonwealth Avenue (St. Paul)" shortTitle="Transitway @ Commonwealth (St. Paul)" lat="44.9805228" lon="-93.1807474" stopId="49"/>
    <stop tag="fairgrou_e" title="State Fairgrounds Lot S108 (St. Paul)" lat="44.9832407" lon="-93.1788092" stopId="52"/>
    <stop tag="bufogort_n" title="Buford & Gortner Avenues (St. Paul)" lat="44.98447" lon="-93.1817856" stopId="55"/>
    <stop tag="studcent" title="St. Paul Student Center" lat="44.9845009" lon="-93.1868539" stopId="10"/>
    <stop tag="bufogort_s" title="Buford & Gortner Avenues (St. Paul)" lat="44.984398" lon="-93.1816392" stopId="13"/>
    <stop tag="fairgrou_w" title="State Fairgrounds Lot S108 (St. Paul)" lat="44.9833134" lon="-93.1790258" stopId="16"/>
    <stop tag="trancomm_w" title="Transitway & Commonwealth" lat="44.9805495" lon="-93.1809199" stopId="19"/>
    <stop tag="thom23rd" title="Thompson Center & 23rd Avenue SE" shortTitle="Thompson Center & 23rd SE" lat="44.9766625" lon="-93.2216215" stopId="22"/>
    <stop tag="4thridd" title="4th Street SE in front of Ridder Arena" shortTitle="4th SE in front of Ridder Arena" lat="44.9780516" lon="-93.2296036" stopId="25"/>
    <stop tag="pleajone_w" title="Pleasant Street at Jones-Eddy Circle (East Bank)" shortTitle="Pleasant @ Jones-Eddy Circle (East Bank)" lat="44.9781822" lon="-93.2360427" stopId="28"/>
    <direction tag="west" title="Westbound" name="" useForUI="true">
      <stop tag="studcent"/>
      <stop tag="bufogort_s"/>
      <stop tag="fairgrou_w"/>
      <stop tag="trancomm_w"/>
      <stop tag="thom23rd"/>
      <stop tag="4thridd"/>
      <stop tag="pleajone_w"/>
    </direction>
    <direction tag="east" title="Eastbound" name="" useForUI="true">
      <stop tag="willey"/>
      <stop tag="19th2nd"/>
      <stop tag="sanford"/>
      <stop tag="univplea"/>
      <stop tag="univrecc"/>
      <stop tag="stad23rd"/>
      <stop tag="trancomm_e"/>
      <stop tag="fairgrou_e"/>
      <stop tag="bufogort_n"/>
    </direction>

The response shows the route's unique id, name, suggests a colour for the route, and provides the bounding lat/long box for the route.

    <route tag="connector" title="Campus Connector" color="ff0000" oppositeColor="ffffff" latMin="44.9723784" latMax="44.9845009" lonMin="-93.2457576" lonMax="-93.1788092">

A number of stops on the route are specified, along with their unique tag.

    <stop tag="studcent" title="St. Paul Student Center" lat="44.9845009" lon="-93.1868539" stopId="10"/>

The direction of the bus is indicated as follows:

    <direction tag="east" title="Eastbound" name="" useForUI="true">
      <stop tag="willey"/>
      <stop tag="19th2nd"/>
      <stop tag="sanford"/>
      <stop tag="univplea"/>
      <stop tag="univrecc"/>
      <stop tag="stad23rd"/>
      <stop tag="trancomm_e"/>
      <stop tag="fairgrou_e"/>
      <stop tag="bufogort_n"/>
    </direction>

There are also a number of path tags which are essentially the shapefile of the bus's route.

The paths are simply lists of coordinates that can be used to draw a route on a map. The path
data can be voluminous. If you do not need the path data you should add “&terse” to the
routeConfig URL and the volume of returned data will be cut approximately in half. This is
especially useful for mobile apps where you want to transfer as little data as possible.

Due to the nature of the configuration there can be many separate paths, some of them
overlapping. A map client should simply draw all of the paths. The paths are not necessarily in
any kind of order so you should only connect the points within a path. You should not connect the
points between two separate paths though.

Getting Arrival Information
---------------------------

Get all buses passing through the stop:

    http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=<agency_tag>&stopId=<stop id>

Get only buses on a particular route passing through the stop:

    http://webservices.nextbus.com/service/publicXMLFeed?command=predic
tions&a=<agency_tag>&stopId=<stop id>&routeTag=<route tag>

Example:

    http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=umn-twin&stopId=10

Response:

  <body copyright="All data copyright University of Minnesota 2013.">
    <predictions agencyTitle="University of Minnesota" routeTitle="Campus Connector" routeTag="connector" stopTitle="St. Paul Student Center" stopTag="studcent">
      <direction title="Westbound">
        <prediction epochTime="1370533500000" seconds="784" minutes="13" isDeparture="true" affectedByLayover="true" dirTag="west" vehicle="3825" block="3111"/>
        <prediction epochTime="1370534400000" seconds="1684" minutes="28" isDeparture="true" affectedByLayover="true" dirTag="west" vehicle="3813" block="3113"/>
        <prediction epochTime="1370535300000" seconds="2584" minutes="43" isDeparture="true" affectedByLayover="true" dirTag="west" vehicle="3816" block="3112"/>
        <prediction epochTime="1370536200000" seconds="3484" minutes="58" isDeparture="true" affectedByLayover="true" dirTag="west" vehicle="3825" block="3111"/>
        <prediction epochTime="1370537100000" seconds="4384" minutes="73" isDeparture="true" affectedByLayover="true" dirTag="west" vehicle="3813" block="3113"/>
      </direction>
      <message text="May Session Schedule: 15 Minute Service from 7:00 AM to 6:00 PM. No Weekend Service"/>
    </predictions>
    <predictions agencyTitle="University of Minnesota" routeTitle="St Paul Circulator" routeTag="stpaul" stopTitle="St. Paul Student Center" stopTag="studcent" dirTitleBecauseNoPredictions="Loop"></predictions>
  </body>

No more than 5 predictions per direction will be provided in the feed.

The predictions are returned in both seconds and minutes. The "minute" value is what should
currently be displayed. The "seconds" value can be used to determine when the minute value will
change requiring an update. Predictions should only be displayed in minutes, rounding down the
number of seconds. The predictions are also provided in "epochTime". Epoch time is a standard,
defined as the number of seconds elapsed since midnight Coordinated Universal Time (UTC) of
January 1, 1970, not counting leap seconds. It is useful for when one needs to display the
prediction time as a time of day, such as "4:15pm".

If **isDeparture** is true, then this is the estimated time at which the bus will depart, otherwise the prediction is for when the bus will arrive.

If **isScheduleBased** is set, then the prediction is not based on real-time data.

If **delayed** is set, the vehicle is traveling slower than was expected over the past few minutes.

NiceRide API
=================================

The [NiceRide](https://secure.niceridemn.org) system rents bicycles on an
hourly basis throughout Minneapolis and St. Paul. Bikes may be rented or
returned from automated stations.

The NiceRide API can be used to get the location of these stations, as well as
the number of bikes available.

The API takes the form a single XML file available at
https://secure.niceridemn.org/data2/bikeStations.xml

The following is the start of this file:

    <stations lastUpdate="1375231472074" version="2.0">
      <station>
      <id>2</id>
      <name>100 Main Street SE</name>
      <terminalName>30000</terminalName>
      <lastCommWithServer>1375231456412</lastCommWithServer>
      <lat>44.984892</lat>
      <long>-93.256551</long>
      <installed>true</installed>
      <locked>false</locked>
      <installDate/>
      <removalDate/>
      <temporary>false</temporary>
      <public>true</public>
      <nbBikes>17</nbBikes>
      <nbEmptyDocks>10</nbEmptyDocks>
      <latestUpdateTime>1375230969269</latestUpdateTime>
      </station>

Washington DC Bike Share API
==========================================================
The [Capitol Bike Share](http://www.capitalbikeshare.com/) system rents
bicycles on an hourly basis in the DC area. Bikes may be rented or returned
from automated stations.

The NiceRide API can be used to get the location of these stations, as well as
the number of bikes available.

The API takes the form a single XML file available at
http://www.capitalbikeshare.com/data/stations/bikeStations.xml

The following is the start of the file:
    <stations lastUpdate="1378089568987" version="2.0">
      <station>
      <id>1</id>
      <name>20th & Bell St</name>
      <terminalName>31000</terminalName>
      <lastCommWithServer>1378089538797</lastCommWithServer>
      <lat>38.8561</lat>
      <long>-77.0512</long>
      <installed>true</installed>
      <locked>false</locked>
      <installDate>1316059200000</installDate>
      <removalDate/>
      <temporary>false</temporary>
      <public>true</public>
      <nbBikes>1</nbBikes>
      <nbEmptyDocks>9</nbEmptyDocks>
      <latestUpdateTime>1378088198251</latestUpdateTime>
      </station>

Other APIs
==============================
[Massachusetts Department of Transportation](http://www.massdot.state.ma.us/DevelopersData.aspx)
