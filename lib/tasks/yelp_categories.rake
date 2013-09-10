namespace :yelp do
  require 'httparty'

  task :load_categories => :environment do
    CATEGORY_URL = 'https://raw.github.com/Yelp/yelp-api/master/category_lists/en/category.json'
    raise HTTParty.get(CATEGORY_URL).parsed_response.to_yaml
  end

end