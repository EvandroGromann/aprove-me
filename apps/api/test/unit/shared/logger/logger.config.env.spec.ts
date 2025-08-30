import path from 'path';

describe('logger.config env-dependent branches', () => {
  const configPath = path.resolve(__dirname, '../../../../src/shared/logger/logger.config');
  const originalEnv = { ...process.env };

  afterEach(() => {
    // restore env and reset module registry
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it("falls back to default version '1.5.0' when npm_package_version is undefined", () => {
    // ensure variable is absent
    const env = { ...originalEnv };
    delete env.npm_package_version;
    process.env = env;

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { loggerConfig } = require(configPath);
      expect(loggerConfig.defaultMeta.version).toBe('1.5.0');
    });
  });

  it('uses npm_package_version when defined (covers version env branch)', () => {
    process.env.npm_package_version = '9.9.9';

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { loggerConfig } = require(configPath);
      expect(loggerConfig.defaultMeta.version).toBe('9.9.9');
    });
  });

  it("sets Console level to 'warn' in production (covers NODE_ENV production branch)", () => {
    process.env.NODE_ENV = 'production';

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const winston = require('winston');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { loggerConfig } = require(configPath);

      const transports = Array.isArray(loggerConfig.transports)
        ? loggerConfig.transports
        : [loggerConfig.transports];

      // find console transport by instanceof of mocked Console transport
      const consoleTransport = transports.find((t: any) => t instanceof winston.transports.Console);
      expect(consoleTransport).toBeTruthy();
      expect(consoleTransport.level).toBe('warn');
    });
  });

  it("sets Console level to 'debug' when not in production (covers else branch)", () => {
    process.env.NODE_ENV = 'test';

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const winston = require('winston');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { loggerConfig } = require(configPath);

      const transports = Array.isArray(loggerConfig.transports)
        ? loggerConfig.transports
        : [loggerConfig.transports];
      const consoleTransport = transports.find((t: any) => t instanceof winston.transports.Console);
      expect(consoleTransport).toBeTruthy();
      expect(consoleTransport.level).toBe('debug');
    });
  });
});
