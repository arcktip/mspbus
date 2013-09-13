class FavoriteController < ApplicationController
  
  before_filter :authenticate_user!
  respond_to :json

  def index
    favorites = Favorite.select('user_id, favorites.stop_id, stops.stop_name').joins([:stop, :source_stops]).where({ user_id: current_user.id })
    respond_with(favorites.to_json(:include => { :source_stops => {:only => [:source_id, :external_stop_id, :external_stop_url, :stop_type]} }))
  end

  def show
    favorite = Favorite.where({ user_id: current_user.id, stop_id: params[:id] })
    respond_with(favorite[0])
  end

  def create
    favorite = Favorite.create(stop_id: params[:stop_id], user_id: current_user.id)
    respond_with(favorite)
  end

  def destroy
    Favorite.destroy_all(user_id: current_user.id, stop_id: params[:id])
    respond_with(:text => '{}', :status => :ok)
  end

end