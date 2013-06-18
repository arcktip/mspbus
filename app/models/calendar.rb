class Calendar < ActiveRecord::Base
  self.table_name = 'calendar'

  def self.get_service_ids
    sql = "CURRENT_TIMESTAMP >= to_date(calendar.start_date, 'YYYYMMDD') and CURRENT_TIMESTAMP <= to_date(calendar.end_date, 'YYYYMMDD') and #{Date.today.strftime("%A").downcase} = '1'"
    where(sql)
  end

end