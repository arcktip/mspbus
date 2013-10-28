require 'spec_helper'

describe HomeController do
  
  before(:each) do
    @stops = create_list(:stop, 30)
  end

  describe "GET table" do  
    it "returns a list stops" do
      params = { 
        lat: @stops.first.stop_lat,
        lon: @stops.first.stop_lon
      }
      raise params.to_yaml

      get :table, params
      raise response.body.to_yaml
      # json = JSON.parse(response.body)
      # expect(json.length).to equal(Favorite.all.count)
    end
  end

  describe "GET sms" do  
    it "returns a list stops" do
    end
  end
end