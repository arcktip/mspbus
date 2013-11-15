$redis = Redis.new(:host => 'localhost', :port => 6379)
HTTParty::HTTPCache.redis = $redis