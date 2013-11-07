require 'spec_helper'

describe Stop do
  it "has a valid factory" do
    build(:stop).should be_valid
  end

  describe "search" do
    before(:each) do
      Stop.tire.index.delete
      Stop.create_elasticsearch_index

      create_list(:stop, 30)

      Stop.all.each do |s|
        s.tire.update_index 
      end
      Stop.tire.index.refresh
    end

    it "should search for stops based on lat/lon" do
      first = Stop.first
      stops = Stop.search({ lat: first.stop_lat, lon: first.stop_lon, radius: 10 })
      expect(stops.results.length).to be > 0
    end
  end
end
