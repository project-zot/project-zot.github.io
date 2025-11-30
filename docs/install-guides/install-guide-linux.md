# Installing zot on Bare Metal Linux

> :point_right: Using an available executable zot image, you can easily deploy
> zot on a Linux server.

## Before you begin

### About binary images

Executable binary zot images are available for multiple platforms and
architectures and with full or minimal implementations.

Refer to [*Released Images for zot*](../general/releases.md) for
information about available zot images along with information about
image variations, image locations, and image naming formats.

## Installation

### Step 1: Get zot

Using `wget,` download the appropriate zot binary image for your
platform from the [zot GitHub project](https://github.com/project-zot/zot).
Download the image to the\`/usr/bin/\` directory and rename it to `zot,` as in this
example:

    sudo wget -O /usr/bin/zot https://github.com/project-zot/zot/releases/download/{{ git.tag }}/zot-linux-amd64

Then fix permissions to it:

    sudo chmod +x /usr/bin/zot
    sudo chown root:root /usr/bin/zot

### Step 2: Create a zot configuration file

Create a zot configuration file as `/etc/zot/config.json`.

See [Configuration file options](#config-file-options) for an example file with
options and recommendations. You can find other configuration file
[examples](https://github.com/project-zot/zot/tree/main/examples) in the
zot GitHub project and in [*Configuring zot*](../admin-guide/admin-configuration.md).

### Step 3: Configure a local authentication account

If you want to use local authentication with zot, create a
`/etc/zot/htpasswd` file with an initial account entry using the
`htpasswd` command as in this example:

    htpasswd -bnB myUserName myPassword > /etc/zot/htpasswd

To add additional local users, use the `>>` redirect as in this example:

    htpasswd -bnB myUserName2 myPassword2 >> /etc/zot/htpasswd

### Step 4: Define the zot service

Create a `/etc/systemd/system/zot.service` file to define the zot service in systemd.
The following is an example service file for zot:

    [Unit]
    Description=OCI Distribution Registry
    Documentation=https://zotregistry.dev/
    After=network.target auditd.service local-fs.target

    [Service]
    Type=simple
    ExecStart=/usr/bin/zot serve /etc/zot/config.json
    Restart=on-failure
    User=zot
    Group=zot
    LimitNOFILE=500000
    MemoryHigh=30G
    MemoryMax=32G

    [Install]
    WantedBy=multi-user.target

> :pencil2:
> Be sure to configure a dedicated non-root user ID as the User and Group in
> the zot service definition. The 'zot' user ID in this example is created in
> the next step.


### Step 5: Create a user ID to own the zot service

Create a non-root user ID to be the owner of the zot service and its resources.

In this example, the user ID 'zot' is created with the `adduser` command, and resource ownership is assigned.

    sudo adduser --no-create-home --disabled-password --gecos --disabled-login zot

    sudo mkdir -p /data/zot
    sudo chown -R zot:zot /data/zot

    sudo mkdir -p /var/log/zot
    sudo chown -R zot:zot /var/log/zot

    sudo chown -R root:root /etc/zot/

With the `adduser` options shown, the 'zot' user ID has no local
directory. There is no ability to log into the zot user account, and the
account has no finger information.

### Step 6: Start zot

Reload systemd config:

    sudo systemctl daemon-reload

Enable and start the zot service with these commands:

    sudo systemctl enable zot
    sudo systemctl start zot

Check if zot config is valid:

    sudo -u zot zot verify /etc/zot/config.json

When the zot service has started, you can check its status with this
command:

    sudo systemctl status zot

## After the installation

If your zot registry server is public facing, we recommend that you test
your TLS configuration using a service such as the [Qualys SSL Server Test](https://www.ssllabs.com/ssltest/).

Refer to [*Configuring zot*](../admin-guide/admin-configuration.md) for further
information about maintaining your zot registry server.

<a name="config-file-options"></a>

## Configuration file options and recommendations

The following zot configuration file (`config.json`) can be used as a
template for your own installation. You can modify this file to suit
your own environment.

> :pencil2: **CVE Scanning Configuration Notes**: The `updateInterval` in the CVE configuration is optional.
> If omitted, it defaults to 2 hours. The minimum value is 2 hours. Before enabling CVE scanning,
> ensure zot has write access to the storage directory and sufficient `/tmp` space for
> Trivy database downloads and layer unpacking.

<details>
  <summary markdown="span">Click here to view the sample configuration file.</summary>

``` json
{
  "distSpecVersion":"1.0.1",
  "storage":{
    "dedupe": true,
    "gc": true,
    "gcDelay": "1h",
    "gcInterval": "6h",
    "rootDirectory":"/data/zot/"
  },
  "http": {
    "address":"0.0.0.0",
    "port":"443",
    "realm":"zot",
    "tls": {
      "cert": "/etc/letsencrypt/live/zothub.io/fullchain.pem",
      "key": "/etc/letsencrypt/live/zothub.io/privkey.pem"
    },
    "auth": {
      "htpasswd": {
        "path": "/etc/zot/htpasswd"
      },
      "failDelay": 5
    }
  },
  "log":{
    "level":"debug",
    "output":"/var/log/zot/zot.log",
    "audit":"/var/log/zot/zot-audit.log"
  },
  "extensions": {
    "search": {
      "enable": true,
      "cve": {
        "updateInterval": "24h"
      }
    },
    "sync": {
      "enable": false,
      "registries": [
        {
          "urls": ["https://mirror.gcr.io/library"],
          "onDemand": true,
          "maxRetries": 3,
          "retryDelay": "5m",
          "pollInterval": "6h"
        },
        {
          "urls": ["https://docker.io/library"],
          "onDemand": true
        }
      ]
    },
    "scrub": {
      "interval": "24h"
    }
  }
}
```

</details>

Refer to [*Configuring zot*](../admin-guide/admin-configuration.md) for more
details about configuration file options.

### TLS encryption

We recommend using a certificate authority such as [Let’s
Encrypt](https://letsencrypt.org/) that offers TLS encryption, as shown
in this configuration example:

``` json
"tls": {
  "cert": "/etc/letsencrypt/live/zothub.io/fullchain.pem",
  "key": "/etc/letsencrypt/live/zothub.io/privkey.pem"
}
```

### Registry synchronization

The example file enables registry synchronization with two other
container registries. In the example, the zot server synchronizes with
the Google and Docker container registries, as shown here:

``` json
"sync": {
  "enable": false,
  "registries": [
    {
      "urls": ["https://mirror.gcr.io/library"],
      "onDemand": true,
      "maxRetries": 3,
      "retryDelay": "5m",
      "pollInterval": "6h"
    },
    {
      "urls": ["https://docker.io/library"],
      "onDemand": true
    }
  ]
}
```
