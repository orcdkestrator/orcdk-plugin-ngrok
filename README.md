# Orcdkestrator Plugin: Ngrok

Ngrok tunnel management plugin for local development with Orcdkestrator

## Installation

```bash
npm install @orcdkestrator/orcdk-plugin-ngrok --save-dev
```

## Configuration

Add to your `orcdk.config.json`:

```json
{
  "plugins": [
    {
      "name": "ngrok",
      "enabled": true,
      "config": {
        // Plugin-specific configuration
      }
    }
  ]
}
```

## Usage

See configuration section above and examples directory for detailed usage.

## API Reference

See [API Documentation](docs/api.md) for detailed information.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Enable/disable the plugin |

## Prerequisites

This plugin requires ngrok to be installed. Download from https://ngrok.com/download

## How It Works

The plugin creates secure tunnels to your local services, enabling webhook testing and external access during development.

## Examples

See the [examples directory](docs/examples/) for complete examples.

## Development

```bash
# Clone the repository
git clone https://github.com/orcdkestrator/orcdk-plugin-ngrok.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.
