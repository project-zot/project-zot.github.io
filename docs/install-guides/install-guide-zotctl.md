# Installing and Upgrading zot with zotctl

> :point_right: `zotctl` installs, upgrades, rolls back, and removes zot on a
> Linux server that runs systemd. It automates the steps in
> [*Installing zot on Bare Metal Linux*](install-guide-linux.md) and adds
> checksum verification, release history, and automatic rollback.

`zotctl` manages the zot installation on the host: the binaries, the systemd
service, and the local user list. It is not a registry client. To work with
the images in a running registry, use [`zli`](../user-guides/zli.md).

## Before you begin

You need:

- A Linux server that runs systemd, on `amd64` or `arm64`, and `root`
  access (use `sudo`).
- A zot configuration file in JSON format. See
  [*Configuring zot*](../admin-guide/admin-configuration.md) and the
  [sample file](install-guide-linux.md#config-file-options).
- These tools: `curl` or `wget`, `sha256sum`, `jq`, and `useradd` or
  `adduser`. `htpasswd` (from `apache2-utils` or `httpd-tools`) is needed only
  to create local users.

`zotctl` checks for these before it changes anything. If something is
missing, it lists what is needed and why, shows the install command for your
distribution, and exits with status 3. It never installs packages itself.

### Get zotctl

`zotctl` is published as a release asset next to the zot binaries and is
covered by the release's checksum file. Download it, verify it, and install it:

```shell
BASE=https://github.com/project-zot/zot/releases/download/{{ git.tag }}
curl -fLO $BASE/zotctl
curl -fLO $BASE/checksums.sha256.txt
grep ' \*zotctl$' checksums.sha256.txt | sha256sum -c -
sudo install -m 0755 zotctl /usr/local/bin/zotctl
```

Run `zotctl --help` to see all commands and options.

## Install zot

Run `install` with your configuration file:

```shell
sudo zotctl install --config config.json --admin-user admin
```

By default `zotctl` downloads the latest release from GitHub, verifies it
against the release's `checksums.sha256.txt`, and installs it. You can choose
the source:

- `--version TAG`: install a specific release, for example `v2.1.22`. The
  default is the latest release.
- `--variant extended|minimal|debug`: which zot binary to install. The default
  is `extended`.
- `--repo OWNER/REPO`: download from another GitHub repository. The default is
  `project-zot/zot`.
- `--dir PATH`: install from a local folder that contains binaries named
  `zot` and `zli`. It cannot be combined with `--version`.

The installer picks `amd64` or `arm64` for the machine it runs on.

The command:

- creates the `zot` system account, which has no home directory and cannot log
  in;
- keeps `config.json` and the user list in `/etc/zot`, owned by root and
  readable by the `zot` account, so a compromised zot cannot rewrite them;
- creates the storage directories and log files named in the configuration
  that do not exist yet, owned by `zot`. Directories that already exist, such
  as a shared `/var/log`, are left as they are. `zotctl` takes every path from
  the configuration, so there is nothing to keep in sync by hand;
- writes the systemd service, a sandboxing drop-in, a log rotation
  configuration, and a health-check timer;
- starts zot and waits until it reports that it is ready.

Use `--config-dir DIR` to keep the configuration somewhere other than
`/etc/zot`, and `--no-harden`, `--no-logrotate`, or `--no-health-timer` to
skip the matching parts.

The paths in the configuration must be absolute, because zot resolves a
relative path against its own working directory. `install` stops, without
changing anything, if `storage.rootDirectory` is not set or if the storage,
log, TLS, or htpasswd paths are relative, and it lists every problem. `upgrade`
warns about them, and `verify` reports them.

`zotctl` does not create TLS certificates. If your configuration uses TLS,
the certificate and key must already exist and be readable by the `zot`
account. Before it starts the service, `zotctl` checks, as the `zot` account,
that the configuration is valid, that the files it names can be read, that the
storage directories and log files can be written, and that the directory of
each log file exists. Problems are reported by name instead of showing up as a
failed start.

### Create the first user

If the configuration enables local (htpasswd) authentication, `install`
creates the first user. Without `--admin-user` it asks for a user name. The
password is never accepted as a command-line value, because it would show up
in the process list and in your shell history. Instead:

- `zotctl` prompts for it, twice, without echoing it; or
- for scripts, use `--password-file FILE` (the file must have mode 0600),
  `--password-stdin`, or the `ZOTCTL_PASSWORD` environment variable.

Passwords must be at least 8 characters and are stored as bcrypt hashes,
which is the only format zot accepts.

## Upgrade zot

```shell
sudo zotctl upgrade
```

`upgrade` accepts the same source options as `install` (`--version`,
`--variant`, `--repo`, `--dir`). Before it touches the running service it:

1. downloads the release and verifies its checksums;
2. runs both binaries to confirm they work on this machine;
3. validates your configuration with the new `zot` binary, as the `zot` user;
4. shows the change and asks for confirmation (use `--yes` to skip).

Then it stops the health timer, switches to the new release, restarts zot, and
waits up to 10 minutes (set `WAIT_SECS` to change this) for it to report that
it is ready. If zot does not come up, `zotctl` switches back to the previous
release automatically and exits with an error.

Add `--dry-run` to any command to see what it would do without changing
anything.

### Upgrade a zot that you installed by hand

`upgrade` also works on a server where zot was installed by following the
[manual steps](install-guide-linux.md). On the first run it moves the existing
binaries into a `legacy-<timestamp>` release, replaces them with links, and
adds the capability setting described in
[How it works](#how-it-works). Your configuration, data, and ownership are not
changed, so you can always return to the old binary with `zotctl rollback`.

## Roll back

```shell
sudo zotctl rollback
```

Every release records the release that it replaced, so repeated rollbacks walk
back through your upgrade history. To go to a specific retained release,
including a newer one, use `--to`:

```shell
sudo zotctl rollback --to v2.1.22
```

## List and remove old releases

`zotctl releases` shows each installed release with its size, install date,
which one is current, and which release it replaced. Use
`zotctl releases --available` to list the tags available on GitHub.

`zotctl upgrade` keeps the five newest releases. To remove others yourself,
use `prune`:

```shell
sudo zotctl prune --keep 3
sudo zotctl prune --release v2.1.20
sudo zotctl prune --older-than 90
```

`prune` lists what it will remove and asks first. It never removes the current
release or the release that `rollback` would return to. It warns when removing
a release would break the rollback history further back. Releases created from
hand-installed binaries (`legacy-*`) are removed only when you name them or add
`--include-legacy`.

## Manage local users

```shell
sudo zotctl user add alice
sudo zotctl user passwd alice
sudo zotctl user remove alice
zotctl user list
```

These commands follow the same password rules as `install`. zot watches its
user list, so changes take effect without a restart. A new user list is owned
by root and readable by the `zot` group. The commands keep the owner and mode
of an existing file.

## Check and operate the service

- `zotctl status`: show the installed release, service state, run user,
  start type, and endpoint health.
- `zotctl verify`: check release checksums, the links in the bin directory,
  the configuration, file access for the `zot` account, and the sandbox
  settings.
- `zotctl config check`: validate the configuration with `zot verify`.
- `zotctl config path`: print the configuration file path.
- `zotctl config show`: print the configuration with secrets replaced by
  `****`.
- `sudo zotctl start`, `stop`, `restart`: control the service and the health
  timer together.
- `zotctl logs [--follow]`: show the service journal.

## Uninstall

```shell
sudo zotctl uninstall
```

This stops zot, removes its service files, releases, and links, and leaves your
configuration, stored images, log files, and the `zot` account in place, and
prints the commands to remove them. To remove everything:

```shell
sudo zotctl uninstall --purge-data --remove-user
```

`--purge-data` deletes the configuration directory, every storage location
named in the configuration (including `subPaths` and the cache directory), and
the log files with their rotated copies. It never deletes the directory that
holds the log files, because that directory may be shared. It lists what it
will delete and asks you to type `delete` (`--yes` skips the question). It
refuses to delete top-level or system directories. Use `--keep-binaries` to
remove only the service.

## How it works

### Releases

Each installed version lives in its own directory, and a `current` link points
to the active one:

```text
/opt/zot/releases/<id>/zot, zli, SHA256SUMS, .previous
/opt/zot/current -> releases/<id>
/usr/local/bin/zot, zli -> /opt/zot/current/...
```

The `.previous` file holds the id of the release that this one replaced, which
is how `rollback` knows where to go. An upgrade changes only the `current`
link, in one atomic step. Use `--prefix` and `--bin-dir` to change the
locations.

### Binding to a privileged port

When the configured port is below 1024, the service gets
`AmbientCapabilities=CAP_NET_BIND_SERVICE` from systemd. You do not need
`setcap` on the binary, and replacing the binary cannot break binding. On a
migrated server this setting is added as a drop-in file,
`zot.service.d/zotctl.conf`.

### Start type

zot releases that send the systemd ready notification run with
`Type=notify`, so `systemctl start` returns when zot is serving, not while the
startup scan is still running. Older builds never send it and would be stopped
after the start timeout, so they run with `Type=simple`. `zotctl` looks for
the notification in each release's binary and updates
`zot.service.d/zotctl-type.conf` on every install, upgrade, and rollback.
`--start-timeout` (default `5min`) sets the timeout for notify builds. Raise
it for very large stores.

### Sandboxing

A fresh install adds `zot.service.d/zotctl-hardening.conf` with
`NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome=read-only`,
`PrivateTmp`, and kernel and control group protection. The directories zot may
write are taken from the configuration: the storage root directory, any
`subPaths`, the cache directory, and the log directories. For an existing
server, `zotctl upgrade --harden` turns this on, and `--no-harden` turns it
off. Once the drop-in exists, each upgrade refreshes it from the
configuration. `zotctl verify` warns when the configuration names a writable
path that the drop-in does not cover.

### Health checks and logs

`zotctl` waits for readiness with `zot healthcheck <config>` when the binary
has it, and falls back to a request to `/v2/` for older builds. The probe runs
on the host itself, so it does not verify the TLS certificate, which is usually
issued for the public name. The health timer script it writes makes the same
choice each time it runs, and it does nothing while zot is still starting up.
zot treats `SIGHUP` as a shutdown request, so the log rotation file uses
`copytruncate` and never signals the process.

## Reference

Global options: `--dry-run`, `--yes`, `--prefix`, `--bin-dir`, `--config-dir`.
Environment: `WAIT_SECS` sets how long to wait for readiness (default 600).

| Exit code | Meaning |
|-----------|---------|
| 0 | Success |
| 1 | The command failed |
| 2 | Usage error |
| 3 | Required tools are missing |
