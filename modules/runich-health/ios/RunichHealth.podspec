require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'RunichHealth'
  s.version        = package['version']
  s.summary        = 'HealthKit bridge for importing completed Runich workouts'
  s.description    = s.summary
  s.license        = { :type => 'MIT' }
  s.authors        = { 'Runich' => 'https://runich-app.ru' }
  s.homepage       = 'https://runich-app.ru'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { :path => '.' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'HealthKit'
  s.source_files = '**/*.{h,m,swift}'
end
