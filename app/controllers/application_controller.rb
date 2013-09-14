class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :redirect_if_old

  protected

  #TODO: Remove this after a while
  def redirect_if_old
    if request.host != 'omgtransit.com'
      redirect_to "http://omgtransit.com#{request.path}", :status => :moved_permanently 
    end
  end
end
