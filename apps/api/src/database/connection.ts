import mongoose from 'mongoose';

import { appConfig } from '@/config';
import { logger } from '@/lib/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Managed MongoDB connection with retry strategy and graceful shutdown.
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connected = false;
  private retryCount = 0;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      logger.debug('db: already connected, skipping');
      return;
    }

    await this.attemptConnect();
    this.attachListeners();
  }

  private async attemptConnect(): Promise<void> {
    try {
      mongoose.set('strictQuery', true);

      await mongoose.connect(appConfig.db.uri, {
        dbName: appConfig.db.name,
        maxPoolSize: appConfig.db.maxPoolSize,
        serverSelectionTimeoutMS: appConfig.db.serverSelectionTimeoutMs,
        connectTimeoutMS: appConfig.db.connectTimeoutMs,
      });

      this.connected = true;
      this.retryCount = 0;
      logger.info('db: connected', {
        db: appConfig.db.name,
        host: mongoose.connection.host,
      });
    } catch (error) {
      logger.error('db: connection failed', {
        attempt: this.retryCount + 1,
        error: error instanceof Error ? error.message : String(error),
      });
      await this.retry();
    }
  }

  private async retry(): Promise<void> {
    if (this.retryCount >= MAX_RETRIES) {
      logger.error('db: max retries reached, giving up');
      process.exit(1);
    }

    this.retryCount++;
    const delay = RETRY_DELAY_MS * this.retryCount;
    logger.info(`db: retrying in ${delay}ms (attempt ${this.retryCount}/${MAX_RETRIES})`);

    await new Promise((resolve) => setTimeout(resolve, delay));
    await this.attemptConnect();
  }

  private attachListeners(): void {
    mongoose.connection.on('disconnected', () => {
      this.connected = false;
      logger.warn('db: disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      this.connected = true;
      logger.info('db: reconnected');
    });

    mongoose.connection.on('error', (err: Error) => {
      logger.error('db: error', { message: err.message });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await mongoose.connection.close();
    this.connected = false;
    logger.info('db: disconnected gracefully');
  }

  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    const state = mongoose.connection.readyState;
    if (state === 1) return 'connected';
    if (state === 2) return 'connecting';
    return 'disconnected';
  }

  isReady(): boolean {
    return this.connected && mongoose.connection.readyState === 1;
  }

  async ping(): Promise<boolean> {
    try {
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const db = DatabaseConnection.getInstance();
