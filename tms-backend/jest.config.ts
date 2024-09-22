import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true, // Tell ts-jest to compile code using ES modules
      },
    ],
    // process `*.tsx` files with `ts-jest`
  },
  moduleNameMapper: {
    "\\.(gif|ttf|eot|svg|png)$": "src/test/__mocks__/fileMock.ts",
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"], // Ensure Jest treats these files as ES modules
};

export default config;
