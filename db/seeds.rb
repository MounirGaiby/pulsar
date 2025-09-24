puts "Seeding data for #{ENV.fetch("RAILS_ENV", "development")} environment".upcase

if User.count.zero? && ENV["ADMIN_EMAIL_ADDRESS"].present? && ENV["ADMIN_PASSWORD"].present?
  Seeding::UserService.create_user(ENV.fetch("ADMIN_EMAIL_ADDRESS"), ENV.fetch("ADMIN_PASSWORD"))
end

# Create test users for development
if Rails.env.development? && User.count < 20
  puts "Creating test users..."

  test_emails = [
    "john.doe@example.com",
    "jane.smith@example.com",
    "bob.wilson@example.com",
    "alice.brown@example.com",
    "charlie.davis@example.com",
    "diana.evans@example.com",
    "edward.frank@example.com",
    "fiona.grace@example.com",
    "george.harris@example.com",
    "helen.ivanov@example.com",
    "ian.johnson@example.com",
    "kate.kim@example.com",
    "liam.lopez@example.com",
    "maria.martinez@example.com",
    "nathan.nguyen@example.com",
    "olivia.ortiz@example.com",
    "peter.patel@example.com",
    "quinn.qureshi@example.com",
    "rachel.rodriguez@example.com",
    "samuel.smith@example.com"
  ]

  test_emails.each do |email|
    next if User.exists?(email_address: email)

    User.create!(
      email_address: email,
      password: "password123"
    )
    puts "Created test user: #{email}"
  end
end
