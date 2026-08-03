import { HttpResponse } from 'msw';

type LegacyResolver = (
  request: Request,
  response: (...transformers: unknown[]) => Response,
  context: {
    status: (status: number) => { type: 'status'; status: number };
    json: (body: unknown) => { type: 'json'; body: unknown };
  },
) => Response;

type Transformer = { type: 'status'; status: number } | { type: 'json'; body: unknown };

export function legacy(resolver: LegacyResolver) {
  return ({ request }: { request: Request }) => {
    const response = (...transformers: unknown[]) => {
      let status = 200;
      let body: unknown;

      for (const transformer of transformers) {
        if (typeof transformer === 'object' && transformer !== null && 'type' in transformer) {
          const typedTransformer = transformer as Transformer;
          if (typedTransformer.type === 'status') status = typedTransformer.status;
          if (typedTransformer.type === 'json') body = typedTransformer.body;
        }
      }

      return new HttpResponse(body === undefined || status === 204 ? null : JSON.stringify(body), {
        status,
        headers: body === undefined || status === 204 ? undefined : { 'Content-Type': 'application/json' },
      });
    };

    return resolver(request, response, {
      status: (status) => ({ type: 'status', status }),
      json: (body) => ({ type: 'json', body }),
    });
  };
}
