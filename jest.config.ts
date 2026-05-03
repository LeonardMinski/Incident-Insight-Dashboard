import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Only test your source
  roots: ["<rootDir>/src"],

  // Recognise TS/TSX
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Map @/ to src/
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Ignore Next build output
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Faster, cleaner output
  clearMocks: true,
};

export default config;
