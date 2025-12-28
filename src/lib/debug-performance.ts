/**
 * Performance debugging utilities
 * Provides consistent timing and logging for performance analysis
 */

// Check if performance debugging is enabled (can be controlled via env var)
const isDebugEnabled = () => {
  if (typeof window === 'undefined') {
    // Server-side: always enabled for now
    return true;
  }
  // Client-side: always enabled for now
  return true;
};

/**
 * Format duration in milliseconds with 1 decimal place
 */
const formatDuration = (ms: number): string => {
  return `${ms.toFixed(1)}ms`;
};

/**
 * Get current high-precision timestamp
 */
export const getTimestamp = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
};

/**
 * Calculate duration from start time
 */
export const getDuration = (startTime: number): number => {
  const endTime = getTimestamp();
  return endTime - startTime;
};

/**
 * Debug server-side timing (logs to terminal)
 */
export const debugServerTiming = (
  component: string,
  operation: string,
  duration: number,
  details?: Record<string, any>
): void => {
  if (!isDebugEnabled()) return;
  
  const emoji = getEmojiForComponent(component);
  const durationStr = formatDuration(duration);
  let logMessage = `[PERF] ${emoji} ${component} - ${operation}: ${durationStr}`;
  
  if (details && Object.keys(details).length > 0) {
    const detailsStr = Object.entries(details)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(', ');
    logMessage += ` (${detailsStr})`;
  }
  
  console.log(logMessage);
};

/**
 * Debug client-side timing (logs to browser console)
 */
export const debugClientTiming = (
  component: string,
  operation: string,
  duration: number,
  details?: Record<string, any>
): void => {
  if (!isDebugEnabled() || typeof window === 'undefined') return;
  
  const emoji = getEmojiForComponent(component);
  const durationStr = formatDuration(duration);
  let logMessage = `[PERF] ${emoji} ${component} - ${operation}: ${durationStr}`;
  
  if (details && Object.keys(details).length > 0) {
    const detailsStr = Object.entries(details)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(', ');
    logMessage += ` (${detailsStr})`;
  }
  
  console.log(logMessage);
};

/**
 * Debug database query performance
 */
export const debugQuery = (
  component: string,
  queryName: string,
  duration: number,
  details?: {
    rowCount?: number;
    cacheHit?: boolean;
    queryType?: string;
    [key: string]: any;
  }
): void => {
  if (!isDebugEnabled()) return;
  
  const emoji = '📊';
  const durationStr = formatDuration(duration);
  let logMessage = `[PERF] ${emoji} ${component} - Query "${queryName}": ${durationStr}`;
  
  if (details) {
    const detailParts: string[] = [];
    if (details.rowCount !== undefined) {
      detailParts.push(`rows=${details.rowCount}`);
    }
    if (details.cacheHit !== undefined) {
      detailParts.push(`cache=${details.cacheHit ? 'hit' : 'miss'}`);
    }
    if (details.queryType) {
      detailParts.push(`type=${details.queryType}`);
    }
    // Add any other details
    Object.entries(details).forEach(([key, value]) => {
      if (!['rowCount', 'cacheHit', 'queryType'].includes(key)) {
        detailParts.push(`${key}=${JSON.stringify(value)}`);
      }
    });
    
    if (detailParts.length > 0) {
      logMessage += ` (${detailParts.join(', ')})`;
    }
  }
  
  if (typeof window === 'undefined') {
    console.log(logMessage);
  } else {
    console.log(logMessage);
  }
};

/**
 * Get emoji for component type
 */
const getEmojiForComponent = (component: string): string => {
  const lower = component.toLowerCase();
  
  if (lower.includes('color') || lower.includes('colorstyle')) {
    return '🎨';
  }
  if (lower.includes('font') || lower.includes('fontstyle')) {
    return '🔤';
  }
  if (lower.includes('sidebar')) {
    return '📊';
  }
  if (lower.includes('layout')) {
    return '🕐';
  }
  if (lower.includes('provider')) {
    return '⚙️';
  }
  if (lower.includes('api') || lower.includes('route')) {
    return '🌐';
  }
  if (lower.includes('navigation')) {
    return '🧭';
  }
  
  return '🕐';
};

/**
 * Create a timing wrapper for async operations
 */
export const timeAsync = async <T>(
  component: string,
  operation: string,
  fn: () => Promise<T>,
  isServer: boolean = false,
  details?: Record<string, any>
): Promise<T> => {
  const startTime = getTimestamp();
  try {
    const result = await fn();
    const duration = getDuration(startTime);
    if (isServer) {
      debugServerTiming(component, operation, duration, details);
    } else {
      debugClientTiming(component, operation, duration, details);
    }
    return result;
  } catch (error) {
    const duration = getDuration(startTime);
    const errorDetails = { ...details, error: error instanceof Error ? error.message : 'Unknown error' };
    if (isServer) {
      debugServerTiming(component, `${operation} (ERROR)`, duration, errorDetails);
    } else {
      debugClientTiming(component, `${operation} (ERROR)`, duration, errorDetails);
    }
    throw error;
  }
};

/**
 * Create a timing wrapper for sync operations
 */
export const timeSync = <T>(
  component: string,
  operation: string,
  fn: () => T,
  isServer: boolean = false,
  details?: Record<string, any>
): T => {
  const startTime = getTimestamp();
  try {
    const result = fn();
    const duration = getDuration(startTime);
    if (isServer) {
      debugServerTiming(component, operation, duration, details);
    } else {
      debugClientTiming(component, operation, duration, details);
    }
    return result;
  } catch (error) {
    const duration = getDuration(startTime);
    const errorDetails = { ...details, error: error instanceof Error ? error.message : 'Unknown error' };
    if (isServer) {
      debugServerTiming(component, `${operation} (ERROR)`, duration, errorDetails);
    } else {
      debugClientTiming(component, `${operation} (ERROR)`, duration, errorDetails);
    }
    throw error;
  }
};

