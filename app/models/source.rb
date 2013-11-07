class Source < ActiveRecord::Base
  attr_accessible :id, :name, :realtime_url

  def self.get_source_by_key(key)
    where({ name: key })
  end
end