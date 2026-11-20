require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'RunichAuth'
  s.version        = package['version']
  s.summary        = 'Native Yandex and VK ID sign-in for Runich'
  s.description    = s.summary
  s.license        = { :type => 'Proprietary' }
  s.authors        = { 'Runich' => 'https://runich-app.ru' }
  s.homepage       = 'https://runich-app.ru'
  s.platform        = :ios, '16.4'
  s.swift_version  = '5.9'
  s.source         = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'YandexLoginSDK', '3.2.0'
  s.dependency 'VKID', '3.0.0'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
