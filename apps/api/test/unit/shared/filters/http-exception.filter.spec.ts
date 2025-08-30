import { HttpExceptionFilter } from '../../../../src/shared/filters/http-exception.filter';
import { HttpException } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  it('responds with exception body and uses traceId if present', () => {
    const fakeW = { setContext: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(), setTraceId: jest.fn() } as any;
  const filter = new HttpExceptionFilter(fakeW);

  expect(fakeW.setContext).toHaveBeenCalledWith('HttpExceptionFilter');

    const exc = new HttpException({ message: 'fail' }, 400);

    const req: any = { traceId: 't1' };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    const host: any = { switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }) };

    filter.catch(exc, host);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('does not set traceId when it is missing and still returns response', () => {
    const logger = { setContext: jest.fn(), setTraceId: jest.fn() } as any;
    const filter = new HttpExceptionFilter(logger);

    const exception = new (HttpException as any)({ err: true }, 500);
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    const host: any = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({})
      })
    };

    filter.catch(exception, host);

    expect(logger.setTraceId).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ err: true });
  });
});
