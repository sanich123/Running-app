const config = {
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest-setup.ts'],
  setupFiles: ['./tests/set-up-async-storage/set-up-async-storage.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase|@rnmapbox|react-redux)',
  ],
  moduleNameMapper: {
    '^@C/(.*)$': '<rootDir>/components/$1',
    '^@const/(.*)$': '<rootDir>/constants/$1',
    '^@R/(.*)$': '<rootDir>/redux/$1',
    '^@U/(.*)$': '<rootDir>/utils/$1',
    '^@A/(.*)$': '<rootDir>/auth/$1',
    '^@T/(.*)$': '<rootDir>/tests/$1',
  },
};

export default config;
