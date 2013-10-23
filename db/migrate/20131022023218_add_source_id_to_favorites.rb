class AddSourceIdToFavorites < ActiveRecord::Migration
  def change
    add_column :favorites, :stop_source_id, :integer
  end
end
