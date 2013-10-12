class CreateCalendars < ActiveRecord::Migration
  def up
    create_table :calendars, id: false do |t|
      t.integer :source_id
      t.string :service_id
      t.boolean :monday
      t.boolean :tuesday
      t.boolean :wednesday
      t.boolean :thursday
      t.boolean :friday
      t.boolean :saturday
      t.boolean :sunday
      t.date :start_date
      t.date :end_date

      t.timestamps
    end
    execute "ALTER TABLE calendars ADD PRIMARY KEY (source_id, service_id);"
  end

  def down
    drop_table :calendars
  end
end
