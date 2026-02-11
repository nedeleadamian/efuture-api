import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export type Response<T> =
  | {
      statusCode: number;
      data: T;
      meta?: any;
    }
  | {
      statusCode: number;
      [key: string]: any;
    };

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;


        const isPaginated = res && typeof res === 'object' && 'data' in res && 'meta' in res;


        if (isPaginated) {
          return {
            statusCode,
            ...res,
          };
        }


        return {
          statusCode,
          data: res || {},
        };
      }),
    );
  }
}
