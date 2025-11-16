module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'parsers/**/*.js',
    'index.js'
  ]
};
