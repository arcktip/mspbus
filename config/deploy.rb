require "rvm/capistrano"
require "bundler/capistrano"

#before 'deploy:setup', 'rvm:install_rvm'
set :rvm_type, :system
# Load Bundler's Capistrano plugin
set :bundle_flags,    "--deployment"
set :bundle_without,  [:development, :test, :tools]
set :default_shell, :bash

set :application, "omgtransit"
set :repository,  "git://github.com/r-barnes/mspbus.git"
set :scm, :git

set :use_sudo, false
set :group_writable, true

default_run_options[:pty] = true
set :ssh_options, { :forward_agent => true }

desc "Run on development server" 
task :development do
  # set :branch, "map-refactor"
  set :current_path, "/var/www/omgtransit-dev/current"
  set :rails_env,    "development"
  set :deploy_to,    "/var/www/omgtransit-dev"
end

task :production do
  set :current_path, "/var/www/omgtransit/current"
  set :branch,       "master"
  set :rails_env,    "production"
  set :deploy_to,    "/var/www/omgtransit"
end

role :web, "omgtransit.com"
role :app, "omgtransit.com"
role :db,  "omgtransit.com", :primary => true

# if you want to clean up old releases on each deploy uncomment this:
#after 'deploy:update_code', :setup_group
after "deploy:restart", "deploy:cleanup"

task :setup_group do
  run "sudo /bin/chmod -R g+w #{deploy_to}*"
  run "sudo /bin/chgrp -R omguser #{deploy_to}*"
end

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  #run "newgrp mspbus"
  task :start do ; end
  task :stop do ; end
#  desc "Symlinks the database.yml"
#  task :symlink_db, :roles => :web do
#    run "ln -nfs #{deploy_to}/shared/config/database.yml #{release_path}/config/database.yml"
#  end
  task :restart, :roles => :web, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
