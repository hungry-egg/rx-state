module.exports = {
  roots: ["src", "tests"],
  transform: { "\\.ts$": "ts-jest" },
  testRegex: "\\.test\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],
  modulePaths: ["<rootDir>/src"],
};
