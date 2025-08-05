/* eslint-disable no-console */
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Plugin, PluginConfig, OrcdkConfig, EventBus, EventTypes, OrcdkEvent } from '@orcdkestrator/core';

/**
 * Ngrok plugin for local development tunnel management
 * Migrated from DeployManager LocalSetupManager
 */
export class NgrokPlugin implements Plugin {
  public readonly name = '@orcdkestrator/orcdk-plugin-ngrok';
  public readonly version = '1.0.0';
  
  private config: PluginConfig | null = null;
  private orcdkConfig: OrcdkConfig | null = null;
  private envFilePath: string = '';
  private port: number = 3000;
  private enabledStacks: string[] = [];
  private eventBus: EventBus | null = null;

  /**
   * Initialize plugin with configuration
   */
  async initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void> {
    this.config = config;
    this.orcdkConfig = orcdkConfig;
    
    // Extract configuration
    this.port = (config.config?.port as number) || 3000;
    this.enabledStacks = (config.config?.enabledStacks as string[]) || ['mcp-discord', 'smaaash'];
    
    // Set env file path based on current environment
    const currentEnv = process.env.CDK_ENVIRONMENT || 'local';
    this.envFilePath = path.join(process.cwd(), `.env.${currentEnv}`);
    
    // Subscribe to events
    this.eventBus = EventBus.getInstance();
    this.subscribeToEvents();
  }
  
  /**
   * Subscribe to relevant events
   */
  private subscribeToEvents(): void {
    if (!this.eventBus) return;
    
    // Listen for stack deploy events
    this.eventBus.on(EventTypes['orchestrator:before:stack-deploy'], async (event: unknown) => {
      const typedEvent = event as OrcdkEvent<{ stackName: string }>;
      const { stackName } = typedEvent.data;
      await this.setupForStack(stackName);
    });
    
    // Listen for error events
    this.eventBus.on(EventTypes['plugin:error'], (event: unknown) => {
      const typedEvent = event as OrcdkEvent<{ error: Error; context: string }>;
      const { error, context } = typedEvent.data;
      console.error(`[ngrok] Error in ${context}:`, error.message);
    });
  }

  /**
   * Setup ngrok for specific stacks that require it
   */
  private async setupForStack(stackName: string): Promise<void> {
    if (!this.orcdkConfig) {
      return;
    }

    // Only setup for local environments
    const currentEnv = process.env.CDK_ENVIRONMENT;
    if (!currentEnv) {
      return;
    }

    const envConfig = this.orcdkConfig.environments[currentEnv];
    if (!envConfig?.isLocal) {
      return; // Skip for cloud environments
    }

    // Only setup for enabled stacks
    if (!this.enabledStacks.includes(stackName)) {
      return;
    }

    console.log(`[ngrok] Setting up tunnel for stack: ${stackName}`);
    await this.setupNgrok();
  }

  /**
   * Setup ngrok tunnel
   */
  private async setupNgrok(): Promise<void> {
    const isRunning = await this.isNgrokRunning();
    if (isRunning) {
      console.log('[ngrok] Tunnel already running');
      return;
    }

    console.log('[ngrok] Starting tunnel...');
    const url = await this.startNgrok();
    await this.updateEnvFile('MCP_EXTERNAL_URL', url);
    console.log(`[ngrok] Tunnel established: ${url}`);
  }

  /**
   * Check if ngrok is already running
   */
  private async isNgrokRunning(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:4040/api/tunnels');
      const data = await response.json() as { tunnels?: unknown[] };
      return data.tunnels !== undefined && data.tunnels.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Start ngrok tunnel
   */
  private async startNgrok(): Promise<string> {
    return new Promise((resolve, reject) => {
      const ngrok = spawn('ngrok', ['http', this.port.toString()], {
        detached: true,
        stdio: 'ignore',
      });

      ngrok.unref();

      // Wait for ngrok to start
      setTimeout(async () => {
        try {
          const url = await this.getNgrokUrl();
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }, 2000);
    });
  }

  /**
   * Get ngrok tunnel URL
   */
  private async getNgrokUrl(): Promise<string> {
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json() as { 
      tunnels: Array<{ proto: string; public_url: string }> 
    };
    
    const tunnel = data.tunnels.find(t => t.proto === 'https');
    if (!tunnel) {
      throw new Error('No HTTPS tunnel found');
    }
    
    return tunnel.public_url;
  }

  /**
   * Update environment file with ngrok URL
   */
  private async updateEnvFile(key: string, value: string): Promise<void> {
    let content = '';
    
    try {
      content = await fs.promises.readFile(this.envFilePath, 'utf-8');
    } catch {
      // File doesn't exist, create it
    }
    
    const lines = content.split('\\n');
    const updated = this.updateEnvLines(lines, key, value);
    
    await fs.promises.writeFile(
      this.envFilePath,
      updated.join('\\n'),
      'utf-8'
    );
  }

  /**
   * Update environment variable in lines
   */
  private updateEnvLines(
    lines: string[],
    key: string,
    value: string,
  ): string[] {
    const keyIndex = lines.findIndex(line => line.startsWith(`${key}=`));
    
    if (keyIndex >= 0) {
      lines[keyIndex] = `${key}=${value}`;
    } else {
      lines.push(`${key}=${value}`);
    }
    
    return lines;
  }

  /**
   * Stop ngrok tunnel
   */
  async stopNgrok(): Promise<void> {
    try {
      const response = await fetch('http://localhost:4040/api/tunnels', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('[ngrok] Tunnel stopped');
      }
    } catch {
      // Ngrok not running
    }
  }

  /**
   * Cleanup plugin resources
   */
  async cleanup(): Promise<void> {
    await this.stopNgrok();
    
    // Unsubscribe from events
    if (this.eventBus) {
      this.eventBus.removeAllListeners(EventTypes['orchestrator:before:stack-deploy']);
      this.eventBus.removeAllListeners(EventTypes['plugin:error']);
    }
  }
}

// Export as default for easy importing
export default NgrokPlugin;