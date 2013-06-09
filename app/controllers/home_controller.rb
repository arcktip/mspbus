class HomeController < ApplicationController
  def index
    unless cookies[:lat] && cookies[:lon]
      params[:lat] = 44.979971
      params[:lon] = -93.269797
    else 
      params[:lat] = cookies[:lat]
      params[:lon] = cookies[:lon]
    end
    params[:radius] = 1

    @inbounds=true
    if not (44.47<=params[:lat].to_f and params[:lat].to_f<=45.42 and -94.01<=params[:lon].to_f and params[:lon].to_f<=-92.73)
      params[:lat] = 44.979971
      params[:lon] = -93.269797
      @inbounds=false
    end

    if !params[:q].present? && cookies[:q].present?
      params[:q]=cookies[:q]
    end

    @stops = Stop.search(params)
    @lat=params[:lat]
    @lon=params[:lon]
  end

  def about

  end
  
  def feedback
    
  end
end
