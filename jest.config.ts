import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  collectCoverage: false,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
export default config;