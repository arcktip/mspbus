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

ActiveRecord::Schema.define(:version => 20130603163719) do

  create_table "stops", :force => true do |t|
    t.string  "stop_id",                            :null => false
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
  end

end
