require 'faker'

FactoryGirl.define do
  factory :stop do |f|
    sequence(:id) { |n| [n, 1] }
    f.stop_name { Faker::Company.catch_phrase }
    f.stop_lat { Faker::Address.latitude }
    f.stop_lon { Faker::Address.longitude }
    f.url { Faker::Internet.url }
    f.source_id { 1 }
    f.stop_type { 1 }
  end
end