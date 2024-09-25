"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
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
exports.default = config;
