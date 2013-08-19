class CreateSourceStops < ActiveRecord::Migration
  def up
    create_table :source_stops, id: false do |t|
      t.integer :source_id
      t.integer :stop_id
      t.string :external_stop_id

      t.timestamps
    end
    execute "ALTER TABLE source_stops ADD PRIMARY KEY (source_id, stop_id);"
  end

  def down
    drop_table :source_stops
  end
end
