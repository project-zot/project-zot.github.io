# Event Support for zot

> :point_right: Registry-significant events can be generated and pushed to either HTTP or NATS endpoints.

The events extension allows zot to emit webhook-style notifications for important registry actions. These notifications can be sent to external systems such as automation pipelines, audit processors, message buses, and observability tooling.

Currently supported sink types:

- `http`
- `nats`

## Enabling the events extension

```json
{
  "distSpecVersion": "1.1.1",
  "storage": {
    "rootDirectory": "/tmp/zot"
  },
  "http": {
    "address": "127.0.0.1",
    "port": "8080"
  },
  "log": {
    "level": "debug"
  },
  "extensions": {
    "events": {
      "enable": true,
      "sinks": [
        {
          "type": "http",
          "address": "https://events.example.com/zot",
          "timeout": "1s",
          "credentials": {
            "username": "webhook-user",
            "password": "webhook-password",
            "token": "optional-bearer-token"
          },
          "headers": {
            "X-Custom-Header": "my-value"
          }
        },
        {
          "type": "nats",
          "address": "nats://127.0.0.1:4222",
          "timeout": "10s",
          "channel": "alerts"
        }
      ]
    }
  }
}
```

## Sink attributes

| Attribute | Description |
|-----------|-------------|
| `type` | Sink type. Supported values: `http`, `nats`. |
| `address` | Sink endpoint address. |
| `timeout` | Sink delivery timeout duration. HTTP sinks default to `30s` when this value is omitted or non-positive. |
| `credentials` | Optional credentials block for HTTP sink authentication. |
| `headers` | Optional custom headers for HTTP sink delivery. |
| `channel` | NATS subject/channel used for publishing events. |

<a name="webhook-payload-metadata"></a>

## Webhook payload metadata

Event payloads now include additional metadata fields when request context is available:

- `actor`: information about the initiating user
- `request`: information about the HTTP request

Typical fields:

- `actor.name`
- `request.addr`
- `request.method`
- `request.useragent`

Example payload data:

```json
{
  "name": "space/my-image",
  "reference": "latest",
  "digest": "sha256:abc...",
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "actor": {
    "name": "john"
  },
  "request": {
    "addr": "192.168.0.1:54321",
    "method": "PUT",
    "useragent": "docker/24.0.5"
  }
}
```

> :pencil2:
> For internally triggered operations where no incoming request context exists, `actor` and `request` fields are omitted.

## Image scanned events

When CVE scanning and the events extension are enabled, each successful scan that was not served from the scan cache emits a `zotregistry.image.scanned` CloudEvent. Both scheduled and on-demand scans can emit this event. Re-reading an already cached result does not emit a duplicate event.

The event data includes the repository name, requested tag or digest, resolved digest, media type, and a vulnerability summary:

```json
{
  "name": "space/my-image",
  "reference": "latest",
  "digest": "sha256:abc...",
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "summary": {
    "count": 4,
    "fixableCount": 2,
    "unknownCount": 0,
    "lowCount": 1,
    "mediumCount": 1,
    "highCount": 2,
    "criticalCount": 0,
    "maxSeverity": "HIGH"
  }
}
```

For HTTP sinks, the CloudEvent `type` is also available in the `ce-type` header.
