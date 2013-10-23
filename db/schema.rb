# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20131023142143) do

  create_table "calendars", :id => false, :force => true do |t|
    t.integer  "source_id",  :null => false
    t.string   "service_id", :null => false
    t.boolean  "monday"
    t.boolean  "tuesday"
    t.boolean  "wednesday"
    t.boolean  "thursday"
    t.boolean  "friday"
    t.boolean  "saturday"
    t.boolean  "sunday"
    t.date     "start_date"
    t.date     "end_date"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "favorites", :force => true do |t|
    t.integer  "stop_id"
    t.integer  "user_id"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
    t.integer  "stop_source_id"
  end

  create_table "flat_routes", :id => false, :force => true do |t|
    t.string  "stop_id"
    t.string  "stop_name"
    t.integer "stop_sequence"
    t.string  "arrival_time"
    t.decimal "stop_lat",      :precision => 9, :scale => 6
    t.decimal "stop_lon",      :precision => 9, :scale => 6
    t.string  "route_id"
    t.integer "direction_id"
    t.boolean "monday"
    t.boolean "tuesday"
    t.boolean "wednesday"
    t.boolean "thursday"
    t.boolean "friday"
    t.boolean "saturday"
    t.boolean "sunday"
    t.date    "start_date"
    t.date    "end_date"
    t.string  "trip_id"
    t.integer "agency_id"
    t.string  "trip_headsign"
  end

  add_index "flat_routes", ["route_id"], :name => "route_id"
  add_index "flat_routes", ["start_date", "end_date"], :name => "date_range"
  add_index "flat_routes", ["stop_id"], :name => "stop_id"
  add_index "flat_routes", ["trip_id"], :name => "trip_id"

  create_table "routes", :id => false, :force => true do |t|
    t.integer "source_id",        :null => false
    t.string  "route_id",         :null => false
    t.integer "agency_id",        :null => false
    t.string  "route_short_name"
    t.string  "route_long_name"
    t.string  "route_desc"
    t.integer "route_type"
    t.string  "route_url"
    t.string  "route_color"
    t.string  "route_text_color"
  end

  create_table "source_stops", :id => false, :force => true do |t|
    t.integer  "source_id",                                                           :null => false
    t.integer  "stop_id"
    t.string   "external_stop_id",                                                    :null => false
    t.datetime "created_at",                                                          :null => false
    t.datetime "updated_at",                                                          :null => false
    t.decimal  "external_lat",                          :precision => 9, :scale => 6
    t.decimal  "external_lon",                          :precision => 9, :scale => 6
    t.string   "external_stop_name",                                                  :null => false
    t.string   "external_stop_desc"
    t.string   "external_zone_id",       :limit => 100
    t.string   "external_stop_url"
    t.string   "external_stop_street"
    t.string   "external_stop_city"
    t.string   "external_stop_region"
    t.string   "external_stop_postcode", :limit => 50
    t.string   "external_stop_country",  :limit => 100
    t.integer  "stop_type"
  end

  create_table "sources", :force => true do |t|
    t.string   "name"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
    t.string   "realtime_url"
  end

  create_table "spatial_ref_sys", :id => false, :force => true do |t|
    t.integer "srid",                      :null => false
    t.string  "auth_name", :limit => 256
    t.integer "auth_srid"
    t.string  "srtext",    :limit => 2048
    t.string  "proj4text", :limit => 2048
  end

  create_table "stop_times", :id => false, :force => true do |t|
    t.integer "source_id",      :null => false
    t.string  "trip_id",        :null => false
    t.string  "arrival_time"
    t.string  "departure_time"
    t.string  "stop_id",        :null => false
    t.integer "stop_sequence",  :null => false
  end

  create_table "stops", :force => true do |t|
    t.string  "stop_code"
    t.string  "stop_name",                          :null => false
    t.string  "stop_desc"
    t.string  "stop_lat",                           :null => false
    t.string  "stop_lon",                           :null => false
    t.string  "zone_id",             :limit => 100
    t.string  "stop_url"
    t.string  "stop_timezone"
    t.integer "wheelchair_boarding"
    t.string  "stop_street"
    t.string  "stop_city"
    t.string  "stop_region"
    t.string  "stop_postcode",       :limit => 50
    t.string  "stop_country",        :limit => 100
    t.integer "source_id",                          :null => false
    t.string  "url"
    t.integer "stop_type"
  end

  create_table "trips", :id => false, :force => true do |t|
    t.integer  "source_id",             :null => false
    t.string   "route_id",              :null => false
    t.string   "service_id",            :null => false
    t.string   "trip_id",               :null => false
    t.string   "trip_headsign"
    t.integer  "block_id"
    t.integer  "shape_id"
    t.integer  "direction_id"
    t.integer  "wheelchair_accessible"
    t.datetime "created_at",            :null => false
    t.datetime "updated_at",            :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "provider"
    t.string   "uid"
    t.string   "name"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
