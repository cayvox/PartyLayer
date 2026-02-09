/**
 * PartyLayer Metrics Backend
 * 
 * Cloudflare Workers + D1 based metrics aggregation service.
 * 
 * Endpoints:
 * - POST /api/v1/events   - Receive metrics from SDK
 * - GET  /api/v1/metrics  - Get aggregated metrics
 * - GET  /api/v1/export   - Export metrics for reporting
 * - GET  /health          - Health check
 */

import { handleEvents } from './routes/events';
import { handleMetrics } from './routes/metrics';
import { handleExport } from './routes/export';
import { runDailyAggregation, runMonthlyAggregation, cleanupOldEvents } from './aggregation/scheduled';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', environment: env.ENVIRONMENT }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      
      // API routes
      if (path === '/api/v1/events' && request.method === 'POST') {
        const response = await handleEvents(request, env);
        return addCorsHeaders(response, corsHeaders);
      }
      
      if (path === '/api/v1/metrics' && request.method === 'GET') {
        const response = await handleMetrics(request, env);
        return addCorsHeaders(response, corsHeaders);
      }
      
      if (path === '/api/v1/export' && request.method === 'GET') {
        // API key required for export
        if (env.API_KEY) {
          const authHeader = request.headers.get('Authorization');
          if (authHeader !== `Bearer ${env.API_KEY}`) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders });
          }
        }
        const response = await handleExport(request, env);
        return addCorsHeaders(response, corsHeaders);
      }
      
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Scheduled event: ${event.cron}`);
    
    if (event.cron === '0 0 * * *') {
      // Daily at midnight UTC
      await runDailyAggregation(env);
      await cleanupOldEvents(env);
    }
    
    if (event.cron === '0 0 1 * *') {
      // Monthly on 1st
      await runMonthlyAggregation(env);
    }
  },
};

function addCorsHeaders(response: Response, corsHeaders: Record<string, string>): Response {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
