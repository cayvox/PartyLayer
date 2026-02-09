#!/usr/bin/env tsx
/**
 * CLI Export Tool
 * 
 * Export metrics from the backend for reporting.
 * 
 * Usage:
 *   pnpm export --month=2026-02 --format=csv
 */

const args = process.argv.slice(2);

interface Options {
  month?: string;
  format: 'json' | 'csv';
  endpoint: string;
  apiKey?: string;
}

function parseArgs(): Options {
  const options: Options = {
    format: 'json',
    endpoint: process.env.METRICS_ENDPOINT || 'http://localhost:8787',
  };
  
  for (const arg of args) {
    if (arg.startsWith('--month=')) {
      options.month = arg.slice(8);
    } else if (arg.startsWith('--format=')) {
      options.format = arg.slice(9) as 'json' | 'csv';
    } else if (arg.startsWith('--endpoint=')) {
      options.endpoint = arg.slice(11);
    } else if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.slice(10);
    }
  }
  
  return options;
}

async function main() {
  const options = parseArgs();
  
  if (!options.month) {
    // Default to previous month
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    options.month = date.toISOString().slice(0, 7);
  }
  
  console.log(`Exporting metrics for ${options.month}...`);
  
  const url = `${options.endpoint}/api/v1/export?month=${options.month}&format=${options.format}`;
  
  const headers: Record<string, string> = {};
  if (options.apiKey) {
    headers['Authorization'] = `Bearer ${options.apiKey}`;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      process.exit(1);
    }
    
    const content = await response.text();
    
    if (options.format === 'csv') {
      // Write to file
      const filename = `partylayer-metrics-${options.month}.csv`;
      const fs = await import('fs');
      fs.writeFileSync(filename, content);
      console.log(`Exported to ${filename}`);
    } else {
      // Pretty print JSON
      const data = JSON.parse(content);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Failed to export:', error);
    process.exit(1);
  }
}

main();
