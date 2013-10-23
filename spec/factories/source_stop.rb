require 'faker'

FactoryGirl.define do
  factory :source_stop do |f|
    f.source_id { 1 }  
    f.external_stop_name { Faker::Company.catch_phrase }
  end
end