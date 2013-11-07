class Stop < ActiveRecord::Base

  include Tire::Model::Search
  include Tire::Model::Callbacks

  self.primary_key = :id

  attr_accessible :id, :stop_id, :source_id, :stop_name, :stop_desc, :stop_lat, :stop_lon, :stop_city, :stop_street, :url, :stop_type, :stop_code, :zone_id
  
  belongs_to :source
  has_many :favorites

  # =============================================
  # ElasticSearch
  # Get all indexes: curl http://localhost:9200/_aliases
  # Sample Search: curl http://localhost:9200/mspbus_development_stops/_search
  # =============================================

  mapping do
    indexes :stop_id, type: :string
    indexes :source_id,   type: :integer
    indexes :stop_desc,   type: :string
    indexes :stop_name,   type: :string
    indexes :stop_city,   type: :string
    indexes :stop_street, type: :string

    indexes :location, type: 'geo_point', as: 'location'
    indexes :url, type: :string
    indexes :stop_type, type: :integer
    indexes :extra, type: :object
  end

  def location
    [stop_lon.to_f, stop_lat.to_f]
  end

  def self.search(params)

    tire.search(page: params[:page], per_page: 40) do
      filter :geo_distance, location: "#{params[:lat]},#{params[:lon]}", distance: "#{params[:radius]}mi"
      #filter :term, :source_id => 8
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
      filter :term, :_id => params[:id]
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
