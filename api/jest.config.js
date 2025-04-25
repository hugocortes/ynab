export default {
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["json", "json-summary", "text"],
  coverageDirectory: "coverage/unit",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: "ts-jest",
  testMatch: ["**/*.test.ts"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules", "/dist"],
  transform: {
    "^.+.ts?$": ["ts-jest", { isolatedModules: true }],
  },
};
