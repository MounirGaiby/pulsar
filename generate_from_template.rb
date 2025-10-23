#!/usr/bin/env ruby
require 'fileutils'

# Check for app name argument
if ARGV.empty?
  puts "Error: App name must be provided"
  puts "Usage: ruby generate_from_template.rb APP_NAME"
  puts "Example: ruby generate_from_template.rb MyApp"
  exit 1
end

# Configuration
APP_NAME = ARGV[0]
TEMPLATE_DIR = "template"  # Directory with template files
OUTPUT_DIR = "generated"   # Where to output processed files

unless Dir.exist?(TEMPLATE_DIR)
  puts "Error: Template directory '#{TEMPLATE_DIR}' not found"
  exit 1
end

# Create output directory
FileUtils.mkdir_p(OUTPUT_DIR)

# Process all files
Dir.glob("#{TEMPLATE_DIR}/**/*", File::FNM_DOTMATCH).each do |file|
  next if File.directory?(file)
  next if File.basename(file) == '.' || File.basename(file) == '..'

  # Calculate relative path and output path
  relative_path = file.sub("#{TEMPLATE_DIR}/", "")
  output_file = File.join(OUTPUT_DIR, relative_path)

  # Create output directory if needed
  FileUtils.mkdir_p(File.dirname(output_file))

  # Read file content
  content = File.read(file)

  # Replace placeholders
  content.gsub!('__APP_NAME__', APP_NAME)
  content.gsub!('APPNAME', APP_NAME)

  # Write output
  File.write(output_file, content)
  puts "Processed: #{output_file}"
end

puts "\n✓ Template generation complete!"
puts "App name: #{APP_NAME}"
puts "Output directory: #{OUTPUT_DIR}"
