module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    '!<rootDir>/src/__tests__'
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,ts}",
    "<rootDir>/src/**/*.{spec,test}.{js,ts}",
  ]
};