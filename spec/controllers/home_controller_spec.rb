require 'spec_helper'

describe HomeController do
  
  before(:each) do
    Stop.tire.index.delete
    Stop.create_elasticsearch_index

    @stops = create_list(:stop, 30)

    Stop.all.each do |s|
      s.tire.update_index 
    end
    Stop.tire.index.refresh
  end

  describe "GET table" do  
    it "returns a list stops" do
      # params = { 
      #   lat: @stops.first.stop_lat,
      #   lon: @stops.first.stop_lon
      # }

      # get :table, params
      # json = JSON.parse(response.body)
      # expect(json.length).to equal(Favorite.all.count)
      pending "returns a list of stops"
    end
  end

  describe "GET sms" do  
    it "returns a list stops" do
      pending "returns a sms list of stops"
    end
  end
end