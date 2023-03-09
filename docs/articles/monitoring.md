# Monitoring the registry

> :point_right: **zot** supports a range of monitoring tools including logging, metrics, and benchmarking.

## Logging

Logging for zot operations is configured with the `log` attribute in the configuration file, as shown in the following example.

``` json
"log":{
  "level":"debug",
  "output":"/tmp/zot.log",
  "audit": "/tmp/zot-audit.log"
}
```

The following table lists the configurable attributes.

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr class="header">
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="text-align: left;"><p><code>level</code></p></td>
<td style="text-align: left;"><p>The minimum level for logged events.
The levels are:<br />
<code>panic,</code> <code>fatal,</code> <code>error,</code>
<code>warn,</code> <code>info,</code> <code>debug,</code> and
<code>trace.</code></p></td>
</tr>
<tr class="even">
<td style="text-align: left;"><p><code>output</code></p></td>
<td style="text-align: left;"><p>The filesystem path for the log output file. The default is <code>stdout</code>.</p></td>
</tr>
<tr class="odd">
<td style="text-align: left;"><p><code>audit</code></p></td>
<td style="text-align: left;"><p>(Optional) If a filesystem path is specified for audit logging, an audit log is enabled and will be stored at the specified path.</p></td>
</tr>
</tbody>
</table>

## Metrics

The available methods for collecting metrics varies depending on whether your zot installation is a minimal (distribution-spec-only) image or a full image including extensions.

### Enabling metrics for a full zot image with extensions

Add the `metrics` attribute under `extensions` in the configuration file to enable and configure metrics, as shown in the following example.

``` json
"extensions": {
    "metrics": {
        "enable": true,
        "prometheus": {
            "path": "/metrics"
        }
    }
}
```

The following table lists the configurable attributes for metrics collection.

| Attribute    | Description                                                                                                                                      |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable`     | If this attribute is missing, metrics collection is enabled by default. Metrics collection can be disabled by setting this attribute to `false`. |
| `prometheus` | Attributes under `prometheus` contain configuration settings for the Prometheus node exporter.                                                   |
| `path`       | The server path on which metrics will be exposed.                                                                                                |

### Collecting metrics from a minimal zot image using a node exporter

Although a minimal zot image does not contain a node exporter, it exposes internal metrics in a Prometheus format for collection by a separate node exporter tool such as zxp. The zot companion binary `zxp` is a node exporter that can be deployed with a minimal zot image in order to scrape metrics from the zot server.

Metrics are automatically enabled in the zot server upon first scrape from the node exporter and the metrics are automatically disabled when the node exporter has not performed any scraping for some period. No extra zot configuration is needed for this behavior.

You can download the zxp executable binary for your server platform and architecture under "Assets" on the GitHub [zot releases](https://github.com/project-zot/zot/releases) page.

The binary image is named using the target platform and architecture. For example, the binary for an Intel-based MacOS server is `zxp-darwin-amd64`. To configure the zxp example image, run this command:

`zxp-darwin-amd64 config zxp-config-file`

> :bulb:
> For convenience, you can rename the binary image file to simply `zxp.`


> :bulb:
> A sample Dockerfile for zxp is available at [Dockerfile-zxp](https://github.com/project-zot/zot/blob/main/Dockerfile-zxp).


The configuration file of zxp contains connection details for the zot server from which it will scrape metrics. The following JSON structure is an example of the `zxp-config-file` contents:

``` json
{
    "Server": {
        "protocol": "http",
        "host": "127.0.0.1",
        "port": "8080"
    },
    "Exporter": {
        "port": "8081",
        "log": {
            "level": "debug"
        }
    }
}
```

> :bulb:
> The zxp module does not have Prometheus integration.
>
> The zxp module is not needed with a full zot image.
