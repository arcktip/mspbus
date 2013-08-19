class AlterCompositeKeyOnSourceStops < ActiveRecord::Migration
  def up
    execute "ALTER TABLE source_stops DROP CONSTRAINT source_stops_pkey;"
    execute "ALTER TABLE source_stops ADD CONSTRAINT source_stops_pkey PRIMARY KEY (source_id, external_stop_id);"
    change_column :source_stops, :stop_id, :integer, null: true
  end

  def down
    execute "ALTER TABLE source_stops DROP CONSTRAINT source_stops_pkey;"
    execute "ALTER TABLE source_stops ADD CONSTRAINT source_stops_pkey PRIMARY KEY (source_id, stop_id);"
  end
end