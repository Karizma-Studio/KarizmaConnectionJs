/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'mts'],
    transform: {
        '^.+\\.(ts|mts)$': 'ts-jest'
    },
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)', '**/?(*.)+(spec|test).[m]ts']
};
