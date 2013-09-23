module StopsHelper

  def isBikeStop(source_stops)
    m = source_stops.select { |s| s.stop_type == 2 }

    unless m.empty?
      true
    else
      false
    end
  end

  def calculate_distance(stop)
    if (stop.sort[0].nil?)
      ""
    elsif (stop.sort[0]>2)
      stop.sort[0].round().to_s+" mi"      
    elsif(stop.sort[0]>0.5) then
      stop.sort[0].round(1).to_s+" mi"
    else
      (stop.sort[0]*5280).round().to_s+" ft"
    end
  end
end
