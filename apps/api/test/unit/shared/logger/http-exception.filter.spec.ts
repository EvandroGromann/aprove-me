import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../../../../src/shared/filters/http-exception.filter';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';

describe('HttpExceptionFilter', () => {
  it('propaga status e corpo sem logar e seta traceId se presente', () => {
    const logger = { setContext: jest.fn(), setTraceId: jest.fn() } as any as CustomLogger;
    const filter = new HttpExceptionFilter(logger);

    const exception = new HttpException({ msg: 'x' }, HttpStatus.BAD_REQUEST);
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ traceId: 'tid-xyz' })
      })
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(logger.setTraceId).toHaveBeenCalledWith('tid-xyz');
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({ msg: 'x' });
  });
});
