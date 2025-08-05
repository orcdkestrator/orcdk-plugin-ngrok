# Ngrok Plugin API Reference

## Plugin Configuration

```typescript
interface NgrokConfig {
  enabled: boolean;
  authtoken?: string;
  tunnels?: TunnelConfig[];
}

interface TunnelConfig {
  name: string;
  port: number;
  proto?: 'http' | 'tcp' | 'tls';
  subdomain?: string;
  hostname?: string;
  auth?: string;
  bindTls?: boolean | 'both';
}
```

## Lifecycle Hooks

### `beforeStackDeploy`
Starts configured ngrok tunnels before stack deployment.

### `afterStackDeploy`
Outputs tunnel URLs for easy access.

### `afterStackDestroy`
Closes all active tunnels.

## Methods

### `initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void>`
Initializes the plugin and validates configuration.

### `startTunnel(config: TunnelConfig): Promise<TunnelInfo>`
Starts a single ngrok tunnel with the specified configuration.

### `stopTunnel(name: string): Promise<void>`
Stops a specific tunnel by name.

### `getTunnelUrl(name: string): string | undefined`
Gets the public URL for an active tunnel.

### `stopAllTunnels(): Promise<void>`
Stops all active tunnels.

## Types

```typescript
interface TunnelInfo {
  name: string;
  publicUrl: string;
  port: number;
  proto: string;
  status: 'online' | 'offline';
}
```
