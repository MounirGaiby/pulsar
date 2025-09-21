puts "Seeding data for #{ENV.fetch("RAILS_ENV", "development")} environment".upcase

if User.count.zero? && ENV["ADMIN_EMAIL_ADDRESS"].present? && ENV["ADMIN_PASSWORD"].present?
  Seeding::UserService.create_user(ENV.fetch("ADMIN_EMAIL_ADDRESS"), ENV.fetch("ADMIN_PASSWORD"))
end
