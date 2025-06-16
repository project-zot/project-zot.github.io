# Event Support for zot

> :point_right: Registry-significant events can be generated and pushed to either http or nats endpoints


This example demonstrates how to enable and configure the **events** extension in zot.
The events extension allows zot to emit registry events to external systems, such as message brokers or monitoring platforms.
Currently, http and nats endpoints are supported.


## Example: NATS endpoint


``` json
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
              "address": <sink-endpoint>,
              "timeout": "1s",
              "credentials": {
                  "username": <username>,
                  "password": <password>,
                  "token": <token>
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
      ],
    }
  }
}

```
