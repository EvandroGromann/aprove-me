import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  traceId?: string;
}

@Injectable()
export class RequestContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  static setContext(context: RequestContext) {
    this.asyncLocalStorage.enterWith(context);
  }

  static getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  static getTraceId(): string | undefined {
    return this.getContext()?.traceId;
  }

  static setTraceId(traceId: string) {
    const context = this.getContext() || {};
    context.traceId = traceId;
    this.setContext(context);
  }
}
