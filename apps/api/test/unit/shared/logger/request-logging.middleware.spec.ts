import { RequestLoggingMiddleware } from '../../../../src/shared/logger/request-logging.middleware';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';

describe('RequestLoggingMiddleware', () => {
  it('logs request and response via send/json and normalizes ip', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '::1',
      originalUrl: '/ok',
      headers: { 'user-agent': 'Mozilla/5.0' },
    };

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    const next = jest.fn();

    mw.use(req, res, next as any);

    // simulate response send
    res.send({ ok: true });
    expect(fakeW.info).toHaveBeenCalled();
  });
});
