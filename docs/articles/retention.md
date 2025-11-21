# Configuring zot Tag Retention Policies

> :point_right: To optimize image storage, you can configure tag retention policies to remove images that are no longer needed.

Tag retention policies in zot can specify how many tags of a given repository to retain or how long to retain certain tags.

You can define tag retention policies that apply one or more of the following rules:

- Top <n\> tags most recently pushed
- Top <n\> tags most recently pulled
- Tags pushed in the past <n\> hours
- Tags pulled in the past <n\> hours
- Tags matching a regular expression (regex) pattern


## Configuring retention policies

Retention policies are configured in the `storage` section of the zot configuration file under the `retention` attribute.  One or more policies can be grouped under the `policies` attribute.

By default, if no retention policies are defined, all untagged manifests are deleted, unless they are referenced by indexes or artifacts.
By default, if no retention policies are defined, all tags are retained.

> :warning: If at least one `keepTags` policy is defined for a repository, all tags not matching those policies are removed.  To avoid unintended removals, we recommend defining a default policy, as described in [Configuration notes](#configuration-notes).

### Configuration example

The following example is a simple retention configuration with two policies:

- The first includes all available configuration attributes.
- The second acts as a default policy.

_simple policy example_

```json
  "storage": {
    "retention": {
      "dryRun": false,
      "delay": "24h",
      "policies": [
        {
          "repositories": ["infra/*", "tmp/**"],
          "deleteReferrers": false,
          "deleteUntagged": true,
          "keepTags": [{
            "patterns": ["v2.*", ".*-prod"],
            "mostRecentlyPushedCount": 10,
            "mostRecentlyPulledCount": 10,
            "pulledWithin": "720h",
            "pushedWithin": "720h"
          }]
        },
        {
          "keepTags": [{
            "patterns": [".*"]
          }]
        }
      ]
    }
  }
```

### Configurable attributes

The following table lists the attributes available in the retention policy configuration.

| Attribute | Value | Description |
|-----------| ----- | ------------|
| dryRun | boolean | If `true`, will log a removal action without actually removing the image.  Default is `false`. |
| delay | time | Remove untagged and referrers only if they are older than the specified <time\> hours. Defaults to `gcDelay`. |
| policies | list | A list of policies. |
| repositories | list | A list of glob patterns to match repositories. |
| deleteReferrers | boolean | If true, delete manifests with a missing Subject.  Default is `false`. |
| deleteUntagged | boolean | If true, delete untagged manifests.  Default is `true`. |
| keepTags | list | Criteria for tags to retain always. |
| mostRecentlyPushedCount | count | Retains the top <count\> most recently pushed tags. |
| mostRecentlyPulledCount | count | Retains the top <count\> most recently pulled tags. |
| pushedWithin | time | Retains the tags pushed during the last <time\> hours, such as 24h. |
| pulledWithin | time | Retains the tags pulled during the last <time\> hours, such as 24h. |
| patterns | regex | See Notes. |


### Configuration notes

- All image retention and garbage collection processing is made per repository, not per groups of repositories. The count of retained images in one repository doesn't impact retention for another repository.
- A repository will apply the first policy it matches.
- If a repository matches no policy, the repository and all its tags are retained.
- If at least one `keepTags` policy is defined for a repository, all tags not matching those policies are removed.
- If `keepTags` is present but empty, all tags are retained.
- In general, when multiple rules are configured, a tag is retained if it meets at least one rule.
- When multiple entries are configured under the same `keepTags` list, there is a logical OR applied between them.
- When a regex pattern is combined with one or more other rules inside a single `keepTags` entry, the rules apply only to those tags matching the regex. Given a `keepTags` entry, the retained tags are: `patterns` AND (`pulledWithin` OR `pushedWithin` OR `mostRecentlyPushedCount` OR `mostRecentlyPulledCount`).
- When you specify a regex pattern with no rules other than the default, all tags matching the pattern are retained.
- In the repositories list, a single asterisk (/\*) matches all first-level items in the repository. A double asterisk (/*\*) matches all recursively.

:warning: We recommend defining a default `keepTags` policy, such as the following example, as the last policy in the policy list. All tags that don't match the preceding policies will be retained by this default policy:

_default policy example_

```json
  {
    "keepTags": [{
        "patterns": [".*"]
      }]
  }
```


## Complete configuration file example

The following example shows the configuration of multiple retention policies in the context of a complete configuration file.

```json
{
  "distSpecVersion": "1.1.0-dev",
  "storage": {
    "rootDirectory": "/tmp/zot",
    "gc": true,
    "gcDelay": "2h",
    "gcInterval": "1h",
    "retention": {
      "dryRun": false,
      "delay": "24h",
      "policies": [
        {
          "repositories": ["infra/*", "prod/*"],
          "deleteReferrers": false,
          "keepTags": [{
            "patterns": ["v2.*", ".*-prod"]
          },
          {
            "patterns": ["v3.*", ".*-prod"],
            "pulledWithin": "168h"
          }]
        },
        {
          "repositories": ["tmp/**"],
          "deleteReferrers": true,
          "deleteUntagged": true,
          "keepTags": [{
            "patterns": ["v1.*"],
            "pulledWithin": "168h",
            "pushedWithin": "168h"
          }]
        },
        {
          "repositories": ["**"],
          "deleteReferrers": true,
          "deleteUntagged": true,
          "keepTags": [{
            "mostRecentlyPushedCount": 10,
            "mostRecentlyPulledCount": 10,
            "pulledWithin": "720h",
            "pushedWithin": "720h"
          }]
        }
      ]
    },
    "subPaths": {
      "/a": {
        "rootDirectory": "/tmp/zot1",
        "dedupe": true,
        "retention": {
          "policies": [
            {
              "repositories": ["a/infra/*", "a/prod/*"],
              "deleteReferrers": false
            }
          ]
        }
      }
    }
  },
  "http": {
    "address": "127.0.0.1",
    "port": "8080"
  },
  "log": {
    "level": "debug"
  }
}
```

Given the configuration example above, we can make the following observations.

For repositories having names starting with `infra/` and `prod/`:
- Artifacts referring to missing images will be retained.
- Untagged images pushed more than 24h ago (`delay`) will be deleted by default, as `deleteUntagged` is not specified.
- All tags matching regex pattern `v2.*` will be retained.
- All tags matching regex pattern `.*-prod` will be retained, as they match the first `keepTags` entry, so their presence in the second entry is not necessary.
- Tags matching regex pattern `v3.*` will not be deleted if they were pulled within `168h`.
- All other tags will be deleted.

For repositories having names starting with `tmp/`:
- Artifacts pushed more than 24h ago (`delay`) referring to missing images will be deleted.
- Untagged images pushed more than 24h ago (`delay`) will be deleted.
- Tags matching regex pattern `v1.*` will not be deleted if they were pulled within `168h` or pushed within `168h`.
- All other tags will be deleted.

For repositories having names starting with `a/infra/` and `a/prod/`:
- These repositories are under a separate subpath, with an entirely different retention configuration.
- Artifacts referring to missing images will be retained.
- Untagged images pushed more than 1h ago will be deleted by default, as `deleteUntagged` is not specified and the default value for `delay` is `gcDelay`. In the case of this subpath `gcDelay` has the default value 1h.

For the rest of repositories, all of them matching `**`:
- Artifacts pushed more than 24h ago (`delay`) referring to missing images will be deleted.
- Untagged images pushed more than 24h ago (`delay`) will be deleted.
- Tags will be retained if they were pulled within `720h` or pushed within `720h` or among the 10 most recently pushed images or among the 10 most recently pulled images.
- All other tags will be deleted.

:warning: `subPaths` are a separate feature with use cases outside the scope of this article. Do NOT use `subPaths` just for the purpose of configuring retention.


## Testing retention policies

Before applying retention policies to a production environment, you can test and validate your retention configuration using the `verify-feature retention` subcommand. This command allows you to preview retention policy decisions without running the actual zot server or making any changes to your storage.

The `verify-feature retention` subcommand:
- Runs garbage collection and retention tasks
- Provides immediate feedback on what would be deleted or retained
- Does not require the zot server to be running
- Automatically enables dry-run mode for retention policies

> :warning: For local storage configurations, the zot server must be stopped before running this command to avoid database lock conflicts.

> :warning: While retention policies for tags and untagged manifests run in dry-run mode (preview only), garbage collection actually executes and will clean up orphan blobs that are no longer referenced by any manifest. This means orphan blobs will be permanently deleted during the verification process.

### Basic usage

The basic command requires only a configuration file:

```bash
zot verify-feature retention <config-file>
```

> :information_source: The command runs indefinitely, performing garbage collection and retention tasks at the configured intervals, unless you specify a timeout using the `-t` or `--timeout` option, or manually interrupt it using `SIGINT` (Ctrl+C) or `SIGTERM`.

### Command-line options

The `verify-feature retention` subcommand supports the following options:

| Option | Short | Description |
|--------|-------|-------------|
| `--log-file` | `-l` | Specify a log file location. If not provided, logs are written to standard out. |
| `--gc-interval` | `-i` | Override the GC interval setting from the configuration file. This applies to all storage paths, including subpaths. |
| `--timeout` | `-t` | Set a timeout for waiting for tasks to complete. If not specified, the command waits indefinitely until interrupted. |

### Usage examples

**Basic usage with default settings:**
```bash
zot verify-feature retention /etc/zot/config.json
```

**Save logs to a file:**
```bash
zot verify-feature retention -l /var/log/zot-retention-check.log /etc/zot/config.json
```

**Override GC interval (runs GC tasks every 30 seconds):**
```bash
zot verify-feature retention -i 30s /etc/zot/config.json
```

**Set a timeout (wait up to 5 minutes for tasks to complete):**
```bash
zot verify-feature retention -t 5m /etc/zot/config.json
```

**Combine multiple options:**
```bash
zot verify-feature retention -l /var/log/zot-retention-check.log -i 1m -t 10m /etc/zot/config.json
```

### Requirements

- Garbage collection must be enabled in the configuration file (`"gc": true`)
- For local storage, the zot server must be stopped before running the command
- The configuration file must be valid and accessible

### How it works

When you run `verify-feature retention`, the command:
1. Validates the configuration file
2. Checks that garbage collection is enabled
3. Automatically enables dry-run mode for all retention policies
4. Initializes the storage and metadata database (if retention policies are configured)
5. Runs garbage collection and retention tasks through the scheduler
6. Logs all retention policy decisions for tags and orphan manifests without actually deleting them (dry-run mode)
7. Actually cleans up orphan blobs that are no longer referenced by any manifest
8. Waits for tasks to complete indefinitely, unless:
   - A timeout is specified using the `-t` or `--timeout` option
   - The command is manually interrupted using `SIGINT` (Ctrl+C) or `SIGTERM`

The command will continue running and performing garbage collection and retention tasks at the configured intervals until one of these conditions is met. You can interrupt the command at any time, and it will shut down gracefully.
