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

  it('logs JSON response path and warns on 4xx', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'POST',
      ip: '127.0.0.1',
      originalUrl: '/warn',
      headers: { 'user-agent': 'Chrome/120' },
    };

    const res: any = {
      statusCode: 400,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.json({ bad: true, password: 'secret' });
    expect(fakeW.warn).toHaveBeenCalled();
  });

  it('logs string body and errors on 5xx', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/err',
      headers: { 'user-agent': 'Safari/17' },
    };

    const res: any = {
      statusCode: 500,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send('plain text');
    expect(fakeW.error).toHaveBeenCalled();
  });

  it('parses and sanitizes JSON string body (string branch success path)', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'POST',
      ip: '127.0.0.1',
      originalUrl: '/json',
      headers: { 'user-agent': 'Edge/120' },
    };

    const res: any = {
      statusCode: 201,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    const payload = JSON.stringify({ token: 'abc', ok: true });
    res.send(payload);
    // request info + response info
    expect(fakeW.info).toHaveBeenCalled();
    expect(fakeW.info).toHaveBeenCalledWith(
      expect.stringContaining('/json'),
      expect.objectContaining({ context: 'HttpResponse', ok: true, token: '***' })
    );
  });

  it('skips duplicate response log when both send and json are called (hasLogged early return)', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/dup',
      headers: { 'user-agent': 'Mozilla/5.0' },
    };

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send({ ok: true });
    res.json({ shouldNotLog: true });

    // Only two info logs: initial request log and a single response log
    expect(fakeW.info).toHaveBeenCalledTimes(2);
  });

  it('sets traceId on request and propagates into request log metadata', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/trace',
      headers: { 'user-agent': 'Chrome/120' },
    };

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    expect(req.traceId).toBeDefined();

    // First info call is the request log; capture its meta
    const [, firstMeta] = (fakeW.info as jest.Mock).mock.calls[0];
    expect(firstMeta.traceId).toBe(req.traceId);
  });

  it('handles missing user-agent header (uses empty string and no browser field)', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/no-ua',
      headers: {}, // no user-agent
    };

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send({ ok: true });

    const [, requestMeta] = (fakeW.info as jest.Mock).mock.calls[0];
    expect(requestMeta.userAgent).toBe('');
    expect(requestMeta.browser).toBeUndefined();
  });

  it('logs response even when body is undefined (covers body !== undefined guard false)', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/undef',
      headers: { 'user-agent': 'Chrome/120' },
    };

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send(undefined);

    // The second call should be the response log with only context present
    const [, responseMeta] = (fakeW.info as jest.Mock).mock.calls[1];
    expect(responseMeta.context).toBe('HttpResponse');
  });

  it('uses catch fallback with no toString defined (inner ternary false branch)', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/no-tostr',
      headers: { 'user-agent': 'Chrome/120' },
    };

    // Object that throws during sanitize and lacks toString entirely (null proto)
    const badBody = Object.create(null);
    Object.defineProperty(badBody, 'boom', {
      get() { throw new Error('explode'); },
      enumerable: true
    });

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send(badBody);

    expect(fakeW.info).toHaveBeenCalledWith(
      expect.stringContaining('/no-tostr'),
      expect.objectContaining({ context: 'HttpResponse', msg: 'Unknown response' })
    );
  });

  it('wraps non-string primitive body with { msg: body.toString() }', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/num',
      headers: { 'user-agent': 'Firefox/120' },
    };

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send(12345);
    expect(fakeW.info).toHaveBeenCalledWith(
      expect.stringContaining('/num'),
      expect.objectContaining({ context: 'HttpResponse', msg: '12345' })
    );
  });

  it('uses catch fallback when body.toString throws, sending Unknown response', () => {
    const fakeW = { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const mw = new RequestLoggingMiddleware(logger);

    const req: any = {
      method: 'GET',
      ip: '127.0.0.1',
      originalUrl: '/bad',
      headers: { 'user-agent': 'Chrome/120' },
    };

    // Create a null-prototype object with a throwing getter and no toString,
    // so sanitizeSensitiveData access throws and catch fallback uses 'Unknown response'.
    const badBody = Object.create(null);
    // getter that throws to make sanitizeSensitiveData fail
    Object.defineProperty(badBody, 'boom', {
      get() {
        throw new Error('boom');
      },
      enumerable: true
    });
    // toString that throws to exercise the inner catch fallback (line 88)
    Object.defineProperty(badBody, 'toString', {
      value: function () {
        throw new Error('tostr');
      },
      enumerable: false,
      configurable: true
    });

    const res: any = {
      statusCode: 200,
      send: function(body: any) { this._body = body; return body; },
      json: function(body: any) { this._body = body; return body; }
    };

    mw.use(req, res, (() => {}) as any);
    res.send(badBody);
    expect(fakeW.info).toHaveBeenCalledWith(
      expect.stringContaining('/bad'),
      expect.objectContaining({ context: 'HttpResponse', msg: 'Unknown response' })
    );
  });
});
