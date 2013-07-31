#!/usr/bin/env python

import xml.etree.ElementTree as ET
import sys
import urllib2
import psycopg2

print "Downloading data..."
response = urllib2.urlopen('https://secure.niceridemn.org/data2/bikeStations.xml')
html = response.read()

print "Connecting to database..."
conn = psycopg2.connect("host=localhost dbname=mspbus user=rick")

cur = conn.cursor()

print "Updating database..."
cur.execute("DELETE FROM master_stops WHERE id LIKE 'nice%'")
root = ET.fromstring(html)
for station in root:
  cur.execute("INSERT INTO master_stops (id, name, lat, lon) VALUES (%s, %s, %s, %s)", ( \
      "nice"+station.find('id').text,   \
      station.find('name').text, \
      station.find('lat').text,  \
      station.find('long').text))

conn.commit()
