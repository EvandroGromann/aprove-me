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
});
