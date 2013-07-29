Code to set up the flat_routes table:

    DROP TABLE flat_routes;
    CREATE TABLE flat_routes AS
    SELECT DISTINCT   s.stop_id, s.stop_name, st.stop_sequence, st.arrival_time,
                      s.stop_lat, s.stop_lon, t.route_id, t.direction_id, 
                      c.monday, c.tuesday, c.wednesday, c.thursday, c.friday,
                      c.saturday, c.sunday, c.start_date, c.end_date, t.trip_id
                      FROM stops s
                      INNER JOIN stop_times st ON st.stop_id   = s.stop_id
                      INNER JOIN trips t       ON t.trip_id    = st.trip_id
                      INNER JOIN routes r      ON r.route_id   = t.route_id
                      INNER JOIN calendar c    ON c.service_id = t.service_id
                      ORDER BY t.direction_id, t.trip_id, t.route_id, st.stop_sequence;
    CREATE INDEX date_range ON flat_routes (start_date, end_date);
    CREATE INDEX route_id ON flat_routes (route_id);
    CREATE INDEX stop_id ON flat_routes (stop_id);
