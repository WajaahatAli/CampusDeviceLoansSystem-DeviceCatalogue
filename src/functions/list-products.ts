/**
 * list-products-http.ts
 * ---------------------
 * Azure Function (v4) - HTTP Trigger for GET /products
 * Application layer integration for listing all products.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProductRepo } from '../Config/AppServices';
import { listProducts } from '../app/list-products';

app.http('list-products', {
  route: 'products',
  methods: ['GET'],
  authLevel: 'anonymous', // For now; set to 'function' or 'user' later for security
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('➡️ Handling GET /products request');

    try {
      // Resolve dependencies
      const productRepo = getProductRepo();

      // Call use case
      const products = await listProducts({ productRepo });

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          success: true,
          count: products.length,
          data: products,
        },
      };
    } catch (err: any) {
      context.error('❌ Error in GET /products:', err);

      // Handle known bad requests (e.g., missing config)
      if (err.message?.includes('COSMOS_KEY')) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          jsonBody: {
            success: false,
            error: {
              code: 'MissingConfig',
              message: 'CosmosDB configuration (COSMOS_KEY) is missing or invalid.',
            },
          },
        };
      }

      // Generic 500 error handler
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          success: false,
          error: {
            code: 'InternalServerError',
            message: 'An unexpected error occurred while fetching products.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
          },
        },
      };
    }
  },
});
