class Stop < ActiveRecord::Base

  # Adding elasticsearch
  include Tire::Model::Search
  include Tire::Model::Callbacks

  attr_accessible :id, :stop_name, :stop_desc, :stop_lat, :stop_lon, :stop_city, :stop_street, :source_stops_ids

  has_many :source_stops, :foreign_key => :stop_id

  mapping do
    indexes :id, type: :string
    indexes :stop_desc, type: :string
    indexes :stop_name, type: :string
    indexes :stop_city, type: :string
    indexes :stop_street, type: :string

    indexes :location, type: 'geo_point', as: 'location'
    indexes :source_stops do
      indexes :external_stop_id, type: :string, analyzer: 'snowball'
      indexes :external_stop_url, type: :string, analyzer: 'snowball'
    end
  end

  def to_indexed_json
    to_json(:include => { source_stops: { only: [:external_stop_id, :external_stop_url] } }, :methods => [:location])
  end

  def location
    [stop_lon.to_f, stop_lat.to_f]
  end

  def self.search(params)

    tire.search(page: params[:page], per_page: 40) do
      filter :geo_distance, location: "#{params[:lat]},#{params[:lon]}", distance: "#{params[:radius]}mi"
      if params[:lat].blank?
        query { string params[:q], default_operator: "AND" } if params[:q].present?
      end
      sort do
        by "_geo_distance", "location" => "#{params[:lat]},#{params[:lon]}", "unit" => "mi"
      end
    end
  end

  def self.get_stop_by_id(params)
    tire.search(page: params[:page], per_page: 10) do
      filter :term, :id => params[:id]
    end
  end

  def self.get_stop_by_bounds(n, s, e, w)
    tire.search do
      query { all }
      size 100
      filter :geo_bounding_box, location: {top_left:"#{n},#{w}", bottom_right:"#{s},#{e}"}
    end
  end

end
