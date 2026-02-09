/**
 * POST /api/v1/events
 * 
 * Receive metrics events from SDK instances.
 */

import type { Env } from '../index';
import { validatePayload } from '../utils/privacy';

export async function handleEvents(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await request.json() as unknown;
    
    // Validate payload for privacy
    const validation = validatePayload(payload);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload', details: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { sdkVersion, network, timestamp, metrics, appIdHash } = payload as MetricsPayload;
    
    // Get today's date for app activity tracking
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Insert raw event
    await env.DB.prepare(`
      INSERT INTO events (app_id_hash, sdk_version, network, metrics, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      appIdHash || 'anonymous',
      sdkVersion,
      network,
      JSON.stringify(metrics),
      timestamp
    ).run();
    
    // Update app activity for MAD calculation
    if (appIdHash) {
      await env.DB.prepare(`
        INSERT INTO app_activity (app_id_hash, network, date, event_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(app_id_hash, network, date) 
        DO UPDATE SET event_count = event_count + 1
      `).bind(appIdHash, network, today).run();
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling events:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process event' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

interface MetricsPayload {
  sdkVersion: string;
  network: string;
  timestamp: number;
  metrics: Record<string, number>;
  appIdHash?: string;
  originHash?: string;
}
