class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable, :omniauth_providers => [:google_oauth2, :twitter]

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :provider, :uid, :name
  
  # def self.find_for_open_id(access_token, signed_in_resource=nil)
  # data = access_token.info
  #   if user = User.where(:email => data["email"]).first
  #     user
  #   else
  #     User.create!(:email => data["email"], :password => Devise.friendly_token[0,20])
  #   end
  # end
  def self.find_for_google_oauth2(access_token, signed_in_resource=nil)
    data = access_token.info
    user = User.where(:email => data["email"]).first

    unless user
        user = User.create(name: data["name"],
             email: data["email"],
             provider: 'google',
             password: Devise.friendly_token[0,20]
            )
    end
    user
  end

  def self.find_for_twitter(auth, signed_in_resource=nil)
    user = User.where(:provider => auth.provider, :uid => auth.uid).first

    unless user
      user = User.create(name:auth.extra.raw_info.name,
             provider:auth.provider,
             uid:auth.uid,
             password:Devise.friendly_token[0,20])
    end
    user
  end
  
  def email_required?
    super && provider.blank?
  end
end
