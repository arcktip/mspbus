MspBus::Application.routes.draw do
  
  devise_for :users, :controllers => {:omniauth_callbacks => "users/omniauth_callbacks" }

  devise_scope :user do
    get '/users/auth/:provider(.:format)' => 'users/omniauth_callbacks#passthru', :as => :user_omniauth_authorize
    post '/users/auth/:provider(.:format)' => 'users/omniauth_callbacks#passthru', :as => :user_omniauth_authorize

    get '/users/auth/:provider(.:format)' => 'users/omniauth_callbacks#passthru {:provider=>/twitter|google_oauth2/}', :as => :user_omniauth_callback
    post '/users/auth/:action/callback(.:format)' => 'users/omniauth_callbacks#(?-mix:twitter|google_oauth2)', :as => :user_omniauth_callback
  end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to            => 'home#index'
  post '/table'       => 'home#table'
  post '/sms'         => 'home#sms'
  post '/voice'       => 'home#voice'
  get  '/fav'         => 'home#fav'
  post '/favlist'     => 'home#favlist'
  get  'route/:id'    => 'route#show'
  get  'stop/bounds'  => 'stop#bounds'
  get  'stop/closest_trip'        => 'stop#closest_trip'
  get  'stop/get_stop_neighbours' => 'stop#get_stop_neighbours'
  get  'stop/:stopid/arrivals'    => 'stop#arrivals'
  get  'stop/:id'     => 'stop#show'
  get  'about'        => 'home#about'
  get  'feedback'     => 'home#feedback'
  get  'legal'        => 'home#legal'
  
  # realtime apis
  get 'realtime/niceride' => 'realtime#niceride'

  resources :favorite, :only => [:index, :show, :update, :create, :destroy]
end
