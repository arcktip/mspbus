require 'spec_helper'

describe Stop do
  it "has a valid factory" do
    build(:stop).should be_valid
  end

  describe "search" do
    before(:each) do
      create_list(:stop, 30)
    end

    it "should search for stops based on lat/lon" do
      first = Stop.first
      raise first.to_yaml
      stops = Stop.search({ lat: first.stop_lat, lon: first.stop_lon })
      raise stops.to_yaml
    end
  end
end
