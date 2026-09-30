module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  // Sources import compiled paths ("./utils/x.js"); jest resolves them to the .ts file.
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};
