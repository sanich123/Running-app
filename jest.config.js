const config = {
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest-setup.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@expo-google-fonts|standard-navigation|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@rnmapbox|react-redux|immer|msw|@mswjs|@open-draft|until-async|rettime|strict-event-emitter|headers-polyfill)',
  ],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/tests/utils/style-mock.ts',
    '^@Routes/(.*)$': '<rootDir>/routes/$1',
    '^@S/(.*)$': '<rootDir>/shared/$1',
    '^@const/(.*)$': '<rootDir>/constants/$1',
    '^@R/(.*)$': '<rootDir>/redux/$1',
    '^@U/(.*)$': '<rootDir>/utils/$1',
    '^@A/(.*)$': '<rootDir>/auth/$1',
    '^@T/(.*)$': '<rootDir>/tests/$1',
  },
};

module.exports = config;
