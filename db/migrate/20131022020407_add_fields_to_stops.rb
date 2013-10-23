class AddFieldsToStops < ActiveRecord::Migration
  def up
    add_column :stops, :source_id, :integer
    add_column :stops, :url, :string

    execute "UPDATE stops set source_id = 1;"
    execute "ALTER TABLE stops DROP CONSTRAINT stops_pkey;ALTER TABLE stops ADD PRIMARY KEY (id, source_id);"
  end

  def down
    remove_column :stops, :source_id
    remove_column :stops, :url
    execute "ALTER TABLE stops DROP CONSTRAINT stops_pkey;ALTER TABLE stops ADD PRIMARY KEY (id);"
  end
end
