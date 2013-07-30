Code to set up the flat_routes table:

    DROP TABLE flat_routes;
    CREATE TABLE flat_routes AS
    SELECT DISTINCT   s.stop_id, s.stop_name, st.stop_sequence, st.arrival_time,
                      s.stop_lat, s.stop_lon, t.route_id, t.direction_id, 
                      c.monday, c.tuesday, c.wednesday, c.thursday, c.friday,
                      c.saturday, c.sunday, c.start_date, c.end_date, t.trip_id,
                      r.agency_id
                      FROM stops s
                      INNER JOIN stop_times st ON st.stop_id   = s.stop_id
                      INNER JOIN trips t       ON t.trip_id    = st.trip_id
                      INNER JOIN routes r      ON r.route_id   = t.route_id
                      INNER JOIN calendar c    ON c.service_id = t.service_id
                      ORDER BY t.direction_id, t.trip_id, t.route_id, st.stop_sequence;
    CREATE INDEX date_range ON flat_routes (start_date, end_date);
    CREATE INDEX route_id ON flat_routes (route_id);
    CREATE INDEX stop_id ON flat_routes (stop_id);


Text Queries
============

Get closest trip id for a stop.

    SELECT trip_id FROM flat_routes WHERE '20130729' BETWEEN start_date AND end_date AND monday='1' AND route_id='16-62' AND stop_id='16154' AND arrival_time>='10:40:00' ORDER BY arrival_time LIMIT 1;

Return stops on a trip.

    SELECT * FROM flat_routes WHERE trip_id='6533466-MAY13-MVS-BUS-Weekday-01' ORDER BY stop_sequence;
