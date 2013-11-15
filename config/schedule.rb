# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Examples:
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever
RAILS_ROOT = File.dirname(__FILE__) + '/..'
require File.expand_path(File.dirname(__FILE__) + "/environment")

set :output, "log/cron.log"

# To test run at a cmd prompt 
# $ whenever -w

every 5.minutes do

  # Reload Car2go stops
  rake "omgtransit:reload_car2go", :environment => "#{Rails.env.to_s.downcase}"

  # When in season, reload NiceRide
  # rake "omgtransit:reload_nicerice RAILS_ENV=#{Rails.env.to_s.downcase}"

end