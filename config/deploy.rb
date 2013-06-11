set :application, "MSP Bus"
set :repository,  "git://github.com/r-barnes/mspbus.git"
set :scm, :git

set :use_sudo, false
set :group_writable, true

desc "Run on development server" 
task :development do
  set :rails_env,   "development"
  set :deploy_to, "/var/www/mspbus-dev"
end

task :production do
  set :deploy_to, "/var/www/mspbus"
end

role :web, "debian2.brobston.com"
role :app, "debian2.brobston.com"
role :db,  "debian2.brobston.com", :primary => true

# if you want to clean up old releases on each deploy uncomment this:
after 'deploy:update_code', 'deploy:symlink_db', :setup_group
after "deploy:restart", "deploy:cleanup"

task :setup_group do
  run "chgrp mspbus #{deploy_to} -R"
end

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  desc "Symlinks the database.yml"
  task :symlink_db, :roles => :web do
    run "ln -nfs #{deploy_to}/shared/config/database.yml #{release_path}/config/database.yml"
  end
  task :restart, :roles => :web, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
