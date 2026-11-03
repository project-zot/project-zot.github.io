# Installing zot on Bare Metal Linux

> :point_right: Using an available executable zot image, you can easily deploy
> zot on a Linux server.

> :bulb: These are the manual steps. To automate installing, upgrading, and
> rolling back zot on a systemd host, see
> [*Installing and Upgrading zot with zotctl*](install-guide-zotctl.md).

## Before you begin

### About binary images

Executable binary zot images are available for multiple platforms and
architectures and with full or minimal implementations.

Refer to [*Released Images for zot*](../general/releases.md) for
information about available zot images along with information about
image variations, image locations, and image naming formats.

## Installation

### Step 1: Get zot

Download the zot and `zli` binaries for your platform from the
[zot GitHub project](https://github.com/project-zot/zot), together with the
release's checksum file, and verify them before installing. Set `ARCH` to
`amd64` or `arm64`, as in this example:

    ARCH=amd64
    BASE=https://github.com/project-zot/zot/releases/download/{{ git.tag }}
    mkdir zot-download && cd zot-download
    wget $BASE/zot-linux-$ARCH $BASE/zli-linux-$ARCH $BASE/checksums.sha256.txt
    sha256sum -c --ignore-missing checksums.sha256.txt

Then install the binaries as `zot` and `zli` in the `/usr/bin/` directory,
owned by root:

    sudo install -m 0755 -o root -g root zot-linux-$ARCH /usr/bin/zot
    sudo install -m 0755 -o root -g root zli-linux-$ARCH /usr/bin/zli

> :pencil2: The commands above download the full image. For the minimal image,
> add the `-minimal` suffix to the `zot-linux-$ARCH` file name. See
> [*Released Images for zot*](../general/releases.md).

### Step 2: Create a zot configuration file

Create a zot configuration file as `/etc/zot/config.json`.

See [Configuration file options](#config-file-options) for an example file with
options and recommendations. You can find other configuration file
[examples](https://github.com/project-zot/zot/tree/main/examples) in the
zot GitHub project and in [*Configuring zot*](../admin-guide/admin-configuration.md).

> :pencil2: The paths in your configuration decide which directories and files
> the later steps must prepare: the storage `rootDirectory` and any `subPaths`
> directories, the directories of the `log` files, the TLS certificate and key,
> and the htpasswd file. Use absolute paths. zot resolves a relative path
> against its own working directory, which is not where you would expect. This
> guide uses the values from the sample configuration below: `/data/zot` for
> storage and `/var/log/zot` for logs.

### Step 3: Configure a local authentication account

If you want to use local authentication with zot, create a
`/etc/zot/htpasswd` file with an initial account entry using the
`htpasswd` command. zot accepts only bcrypt hashes, so use the `-B` option.
The command prompts for the password, so it does not appear in the process
list or in your shell history:

    sudo mkdir -p /etc/zot
    sudo htpasswd -B -c /etc/zot/htpasswd myUserName

To add additional local users, run the command again without the `-c`
option, which would otherwise overwrite the file:

    sudo htpasswd -B /etc/zot/htpasswd myUserName2

zot detects changes to this file automatically, so you do not need to restart
the service after adding or removing users. File ownership is set in
[Step 5](#step-5-create-a-user-id-to-own-the-zot-service).

### Step 4: Define the zot service

Create a `/etc/systemd/system/zot.service` file to define the zot service in systemd.
The following is an example service file for zot:

    [Unit]
    Description=OCI Distribution Registry
    Documentation=https://zotregistry.dev/
    After=network.target auditd.service local-fs.target

    [Service]
    Type=notify
    NotifyAccess=main
    TimeoutStartSec=5min
    ExecStart=/usr/bin/zot serve /etc/zot/config.json
    Restart=on-failure
    User=zot
    Group=zot
    LimitNOFILE=500000
    MemoryHigh=30G
    MemoryMax=32G
    AmbientCapabilities=CAP_NET_BIND_SERVICE
    CapabilityBoundingSet=CAP_NET_BIND_SERVICE

    [Install]
    WantedBy=multi-user.target

> :pencil2:
> Be sure to configure a dedicated non-root user ID as the User and Group in
> the zot service definition. The 'zot' user ID in this example is created in
> the next step.

> :pencil2:
> The `AmbientCapabilities` and `CapabilityBoundingSet` lines let the non-root
> zot user bind to a privileged port such as 443. systemd grants the capability
> when it starts the service, so you do not need to run `setcap` on the binary,
> and replacing the binary later cannot break binding. Omit both lines if zot
> listens on a port above 1023, or use socket activation (described below).

With `Type=notify`, zot sends systemd `READY=1` when startup finishes and `STOPPING=1` when shutdown begins. Dependent units then start only after the registry is ready.

- Raise `TimeoutStartSec` if startup can take longer than five minutes, for example during a first-time CVE database download.
- `Type=notify` needs a zot build that sends readiness notifications. Older binaries never send `READY=1` and fail when the startup timeout expires.

If you run an older binary, or you do not need systemd to wait for readiness, use `Type=simple` instead and omit `NotifyAccess` and `TimeoutStartSec`:

```ini
[Service]
Type=simple
ExecStart=/usr/bin/zot serve /etc/zot/config.json
Restart=on-failure
User=zot
Group=zot
LimitNOFILE=500000
MemoryHigh=30G
MemoryMax=32G
AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
```

For container probes or command-line checks, use `zot healthcheck` (alias `zot ready`). It reads the listener from the same configuration file as `zot serve` and probes `/readyz` by default:

```shell
zot healthcheck /etc/zot/config.json
zot healthcheck --endpoint livez /etc/zot/config.json
zot healthcheck --url https://registry.example.com/startupz --timeout 5s
```

The supported endpoints are `livez`, `readyz`, and `startupz`. The command exits with status `0` for a `2xx` response and nonzero otherwise. Use either a configuration-file argument or `--url`, not both.

#### Optional: systemd sandboxing

You can restrict what the zot process can do on the host with a drop-in file.
Create `/etc/systemd/system/zot.service.d/hardening.conf`:

```ini
[Service]
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
ReadWritePaths=/data/zot /var/log/zot
```

`ProtectSystem=strict` makes the file system read-only for zot, so
`ReadWritePaths` must list every directory that zot writes to: the storage
`rootDirectory`, any `subPaths` directories, and the directories of the log
files. The example lists the sample configuration's `/data/zot` and
`/var/log/zot`; replace them with the directories from your own configuration.
The directories must exist before the service starts. Ambient capabilities keep
working with `NoNewPrivileges=yes`.

#### Systemd socket activation

zot can inherit a listening socket from systemd instead of binding the configured HTTP address and port itself. This allows a non-root zot process to listen on a privileged port without `CAP_NET_BIND_SERVICE`.

Create `/etc/systemd/system/zot.socket`:

```ini
[Unit]
Description=OCI Distribution Registry socket

[Socket]
ListenStream=443
NoDelay=true

[Install]
WantedBy=sockets.target
```

Add the following line to the `[Service]` section of `zot.service`:

```ini
Sockets=zot.socket
```

The socket unit must pass exactly one stream socket. Its address and port take precedence over `http.address` and `http.port`; the remaining HTTP configuration, including TLS settings, continues to apply. Socket activation is not supported when zot is configured with multiple HTTP listeners.

After creating both units, enable the socket instead of starting the service directly:

```shell
sudo systemctl daemon-reload
sudo systemctl enable --now zot.socket
```

systemd starts `zot.service` when the first connection reaches the socket.


### Step 5: Create a user ID to own the zot service

Create a non-root system account to run the zot service and own its data and
logs. The configuration files stay owned by root, so a compromised zot process
cannot rewrite its own configuration or user list.

In this example, the 'zot' account is created with the `useradd` command, and
ownership is assigned. The `/data/zot` and `/var/log/zot` directories are the
storage `rootDirectory` and the log directory from the sample configuration.
If your configuration uses other directories, create those instead, and do the
same for any `subPaths` directories:

    sudo useradd --system --user-group --no-create-home --shell /usr/sbin/nologin zot

    sudo mkdir -p /data/zot
    sudo chown -R zot:zot /data/zot

    sudo mkdir -p /var/log/zot
    sudo chown -R zot:zot /var/log/zot

    sudo chown root:root /etc/zot
    sudo chmod 755 /etc/zot
    sudo chown root:zot /etc/zot/config.json /etc/zot/htpasswd
    sudo chmod 640 /etc/zot/config.json /etc/zot/htpasswd

On Debian and Ubuntu you can use `adduser --system --group --no-create-home
--shell /usr/sbin/nologin zot` instead of `useradd`.

With these options the 'zot' account has no home directory and cannot be used
to log in. The `640` mode lets the zot service read the configuration and user
list but not change them. If your configuration references other files, such as
TLS certificates or a sync credentials file, make sure the 'zot' user can read
them. If you do not use local authentication, omit `/etc/zot/htpasswd` from
the `chown` and `chmod` commands.

### Step 6: Start zot

Reload systemd config:

    sudo systemctl daemon-reload

Enable and start the zot service with these commands:

    sudo systemctl enable zot
    sudo systemctl start zot

Check if zot config is valid. Run the check as the zot user so that it also
catches files the service account cannot read:

    sudo -u zot zot verify /etc/zot/config.json

When the zot service has started, you can check its status with this
command:

    sudo systemctl status zot

## After the installation

If your zot registry server is public facing, we recommend that you test
your TLS configuration using a service such as the [Qualys SSL Server Test](https://www.ssllabs.com/ssltest/).

Refer to [*Configuring zot*](../admin-guide/admin-configuration.md) for further
information about maintaining your zot registry server.

### Rotating the log files

The sample configuration writes logs to `/var/log/zot/`, and nothing rotates
them unless you set it up. zot treats `SIGHUP` as a request to shut down, so
rotate the files with `copytruncate` and never signal the process from the
rotation script. Create `/etc/logrotate.d/zot`:

    /var/log/zot/zot.log /var/log/zot/zot-audit.log {
        su zot zot
        weekly
        rotate 8
        compress
        delaycompress
        copytruncate
        missingok
        notifempty
    }

### Upgrading zot

To upgrade manually, download and verify the new binary as in
[Step 1](#step-1-get-zot), then check your configuration with it, keep the
current binary, and replace it:

    chmod +x zot-linux-$ARCH
    ./zot-linux-$ARCH verify /etc/zot/config.json
    sudo cp -p /usr/bin/zot /usr/bin/zot.previous
    sudo install -m 0755 -o root -g root zot-linux-$ARCH /usr/bin/zot.new
    sudo mv /usr/bin/zot.new /usr/bin/zot
    sudo systemctl restart zot
    sudo systemctl status zot

To roll back, move the saved binary back and restart:

    sudo mv /usr/bin/zot.previous /usr/bin/zot
    sudo systemctl restart zot

> :pencil2: With `Type=notify`, an older binary that does not send the ready
> notification fails to start after the timeout. When you roll back to such a
> build, use `Type=simple` as described in [Step 4](#step-4-define-the-zot-service).

The [zotctl](install-guide-zotctl.md) tool does these steps for you, including
checksum verification, release history, and automatic rollback if the new
version does not start.

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
  "distSpecVersion":"1.1.1",
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
    "level":"info",
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
          "urls": [
              "https://index.docker.io"
          ],
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

> :pencil2: The sample sets the log level to `info`. Use `debug` only while
> troubleshooting, because it is verbose and fills the disk quickly.

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

The zot service runs as a non-root user, but Let's Encrypt keeps its `live/`
and `archive/` directories readable only by root, so zot cannot read the key
from there. A common solution is a certbot deploy hook that copies the
renewed certificate where the zot user can read it. Create
`/etc/letsencrypt/renewal-hooks/deploy/zot.sh`, make it executable, and point
the `tls` paths in the configuration at the copies:

    #!/bin/sh
    install -d -m 0750 -o root -g zot /etc/zot/tls
    install -m 0640 -o root -g zot "$RENEWED_LINEAGE/fullchain.pem" /etc/zot/tls/fullchain.pem
    install -m 0640 -o root -g zot "$RENEWED_LINEAGE/privkey.pem" /etc/zot/tls/privkey.pem

zot reloads renewed certificates without a restart. Check access with
`sudo -u zot test -r /etc/zot/tls/privkey.pem && echo ok`.

### Registry synchronization

The example file contains a synchronization configuration for two other
container registries, the Google and Docker container registries, as shown
here. Registry synchronization is disabled in the example (`"enable": false`);
set it to `true` to turn it on:

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
      "urls": [
          "https://index.docker.io"
      ],
      "onDemand": true
    }
  ]
}
```
