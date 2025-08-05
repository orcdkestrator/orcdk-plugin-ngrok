# Ngrok Plugin Examples

## Basic HTTP Tunnel

```json
{
  "plugins": {
    "@orcdkestrator/ngrok": {
      "enabled": true,
      "config": {
        "authtoken": "${NGROK_AUTH_TOKEN}",
        "tunnels": [
          {
            "name": "web",
            "port": 3000,
            "proto": "http"
          }
        ]
      }
    }
  }
}
```

## Multiple Tunnels

```json
{
  "plugins": {
    "@orcdkestrator/ngrok": {
      "enabled": true,
      "config": {
        "authtoken": "${NGROK_AUTH_TOKEN}",
        "tunnels": [
          {
            "name": "api",
            "port": 3000,
            "proto": "http",
            "subdomain": "my-api"
          },
          {
            "name": "admin",
            "port": 8080,
            "proto": "http",
            "auth": "admin:password"
          },
          {
            "name": "database",
            "port": 5432,
            "proto": "tcp"
          }
        ]
      }
    }
  }
}
```

## With Custom Domain

```json
{
  "plugins": {
    "@orcdkestrator/ngrok": {
      "enabled": true,
      "config": {
        "authtoken": "${NGROK_AUTH_TOKEN}",
        "tunnels": [
          {
            "name": "production",
            "port": 3000,
            "proto": "http",
            "hostname": "app.example.com",
            "bindTls": true
          }
        ]
      }
    }
  }
}
```

## Environment Setup

```bash
# Set ngrok auth token
export NGROK_AUTH_TOKEN=your-auth-token-here

# Deploy with tunnels
orcdk deploy

# Output will show:
# Ngrok tunnel 'web' started: https://abc123.ngrok.io -> http://localhost:3000
```
