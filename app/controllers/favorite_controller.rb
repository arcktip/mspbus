class FavoriteController < ApplicationController
  
  before_filter :authenticate_user!
  respond_to :json

  def index
    favorites = Favorite.select('user_id, favorites.stop_id, stops.stop_name, stops.url, stops.stop_type')
                        .joins([:stop])
                        .where({ user_id: current_user.id })

    respond_with(favorites)                    
    #respond_with(favorites.to_json(:include => { :source_stops => {:only => [:source_id, :external_stop_id, :external_stop_url, :stop_type]} }))
  end

  def show
    favorite = Favorite.where({ user_id: current_user.id, stop_id: params[:id], stop_source_id: params[:source_id] })
    respond_with(favorite.first)
  end

  def create
    favorite = Favorite.find_or_create_by_stop_id_and_user_id_and_stop_source_id(stop_id: params[:id], user_id: current_user.id, stop_source_id: params[:source_id])
    respond_with(favorite)
  end

  def destroy
    Favorite.destroy_all(user_id: current_user.id, stop_id: params[:id], stop_source_id: params[:source_id])
    respond_with({:text => '[]', :status => :ok }.to_json)
  end

end