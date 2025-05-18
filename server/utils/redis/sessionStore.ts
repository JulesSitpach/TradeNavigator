// server/utils/redis/sessionStore.ts
import Redis from 'ioredis';
import { Store, SessionData } from 'express-session';
import { getRedisClient } from './index';
import { logger } from '../logger';

// Session key prefix
const SESSION_PREFIX = 'sess:';

/**
 * Redis-based session store for Express
 */
export class RedisSessionStore extends Store {
  private client: Redis | null;
  
  constructor() {
    super();
    this.client = getRedisClient();
  }
  
  /**
   * Get session data
   */
  get(sid: string, callback: (err: any, session?: SessionData | null) => void): void {
    if (!this.client) {
      return callback(null, null);
    }
    
    const key = SESSION_PREFIX + sid;
    
    this.client.get(key, (err, data) => {
      if (err) {
        logger.error('Redis session store error (get):', err);
        return callback(err);
      }
      
      if (!data) {
        return callback(null, null);
      }
      
      let session;
      try {
        session = JSON.parse(data);
      } catch (e) {
        logger.error('Redis session store parse error:', e);
        return callback(e);
      }
      
      return callback(null, session);
    });
  }
  
  /**
   * Set session data
   */
  set(sid: string, session: SessionData, callback?: (err?: any) => void): void {
    if (!this.client) {
      if (callback) callback();
      return;
    }
    
    const key = SESSION_PREFIX + sid;
    
    try {
      const ttl = session.cookie?.maxAge 
        ? Math.floor(session.cookie.maxAge / 1000) 
        : 86400; // Default 1 day
      
      const data = JSON.stringify(session);
      
      this.client.set(key, data, 'EX', ttl, (err) => {
        if (err) {
          logger.error('Redis session store error (set):', err);
        }
        if (callback) callback(err);
      });
    } catch (e) {
      logger.error('Redis session store stringify error:', e);
      if (callback) callback(e);
    }
  }
  
  /**
   * Destroy session
   */
  destroy(sid: string, callback?: (err?: any) => void): void {
    if (!this.client) {
      if (callback) callback();
      return;
    }
    
    const key = SESSION_PREFIX + sid;
    
    this.client.del(key, (err) => {
      if (err) {
        logger.error('Redis session store error (destroy):', err);
      }
      if (callback) callback(err);
    });
  }
  
  /**
   * Touch session (reset expiration)
   */
  touch(sid: string, session: SessionData, callback?: (err?: any) => void): void {
    if (!this.client) {
      if (callback) callback();
      return;
    }
    
    const key = SESSION_PREFIX + sid;
    
    const ttl = session.cookie?.maxAge 
      ? Math.floor(session.cookie.maxAge / 1000) 
      : 86400; // Default 1 day
    
    this.client.expire(key, ttl, (err) => {
      if (err) {
        logger.error('Redis session store error (touch):', err);
      }
      if (callback) callback(err);
    });
  }
  
  /**
   * Get all session IDs
   */
  all(callback: (err: any, sessions?: SessionData[] | { [sid: string]: SessionData } | null) => void): void {
    if (!this.client) {
      return callback(null, {});
    }
    
    const pattern = SESSION_PREFIX + '*';
    
    this.client.keys(pattern, (err, keys) => {
      if (err) {
        logger.error('Redis session store error (all):', err);
        return callback(err);
      }
      
      if (!keys || keys.length === 0) {
        return callback(null, {});
      }
      
      const sessions: { [sid: string]: SessionData } = {};
      let remaining = keys.length;
      
      keys.forEach((key) => {
        this.client?.get(key, (err, data) => {
          if (!err && data) {
            try {
              const sid = key.substring(SESSION_PREFIX.length);
              sessions[sid] = JSON.parse(data);
            } catch (e) {
              logger.error('Redis session store parse error:', e);
            }
          }
          
          remaining -= 1;
          if (remaining === 0) {
            callback(null, sessions);
          }
        });
      });
    });
  }
  
  /**
   * Count active sessions
   */
  length(callback: (err: any, length?: number) => void): void {
    if (!this.client) {
      return callback(null, 0);
    }
    
    const pattern = SESSION_PREFIX + '*';
    
    this.client.keys(pattern, (err, keys) => {
      if (err) {
        logger.error('Redis session store error (length):', err);
        return callback(err);
      }
      
      callback(null, keys ? keys.length : 0);
    });
  }
  
  /**
   * Clear all sessions
   */
  clear(callback?: (err?: any) => void): void {
    if (!this.client) {
      if (callback) callback();
      return;
    }
    
    const pattern = SESSION_PREFIX + '*';
    
    this.client.keys(pattern, (err, keys) => {
      if (err) {
        logger.error('Redis session store error (clear):', err);
        if (callback) callback(err);
        return;
      }
      
      if (!keys || keys.length === 0) {
        if (callback) callback();
        return;
      }
      
      this.client?.del(...keys, (err) => {
        if (err) {
          logger.error('Redis session store error (clear del):', err);
        }
        if (callback) callback(err);
      });
    });
  }
}