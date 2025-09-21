class Seeding::UserService
  def self.create_user(email_address, password)
    User.create!(email_address: email_address, password: password)
    puts "Created user with email address #{email_address}"
  end
end
