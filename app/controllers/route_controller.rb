class RouteController < ApplicationController
  def show
    @route = Route.get_stop_list(params[:id])
  end
end
