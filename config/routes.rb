OmgTransit::Application.routes.draw do
  
  devise_for :users, :controllers => {:omniauth_callbacks => "users/omniauth_callbacks" }

  devise_scope :user do
    get '/users/auth/:provider(.:format)' => 'users/omniauth_callbacks#passthru', :as => :user_omniauth_authorize
    post '/users/auth/:provider(.:format)' => 'users/omniauth_callbacks#passthru', :as => :user_omniauth_authorize

    get '/users/auth/:provider(.:format)' => 'users/omniauth_callbacks#passthru {:provider=>/twitter|google_oauth2/}', :as => :user_omniauth_callback
    post '/users/auth/:action/callback(.:format)' => 'users/omniauth_callbacks#(?-mix:twitter|google_oauth2)', :as => :user_omniauth_callback
  end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  get  'about'                    => 'home#about'
  get  'feedback'                 => 'home#feedback'
  get  '/fav'                     => 'home#fav'
  post '/favlist'                 => 'home#favlist'
  get  'flat_route/:id'           => 'flat_route#show'
  get  'route/:id'                => 'route#show'
  post '/sms'                     => 'home#sms'
  get  'stop/bounds'              => 'stop#bounds'
  get  'stop/closest_trip'        => 'stop#closest_trip'
  get  'stop/get_stop_neighbours' => 'stop#get_stop_neighbours'
  get  'stop/:stopid/arrivals'    => 'stop#arrivals'
  get  'stop/:source/:id'         => 'stop#show'
  get '/table'                    => 'home#table'
  root :to                        => 'home#index'
  post '/voice'                   => 'home#voice'
  post '/voice_respond'           => 'home#voice_respond'
  
  # realtime apis
  get  'realtime/niceride'        => 'realtime#niceride'
  get  'realtime/car2go/:id'      => 'realtime#car2go'
  get  'realtime/amtrak'          => 'realtime#amtrak'

  resources :favorite, :only => [:index, :show, :update, :create, :destroy]
end
