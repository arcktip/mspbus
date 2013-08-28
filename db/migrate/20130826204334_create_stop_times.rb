class CreateStopTimes < ActiveRecord::Migration
  def up
    create_table :stop_times, id: false do |t|
      t.integer :source_id
      t.integer :trip_id
      t.date :arrival_time
      t.date :departure_time
      t.integer :stop_id
      t.integer :stop_sequence

      t.timestamps
    end
    execute "ALTER TABLE stop_times ADD PRIMARY KEY (source_id, trip_id, stop_id);"
  end

  def down
    drop_table :stop_times
  end
end