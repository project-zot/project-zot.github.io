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
          "repoNames": ["infra/*", "tmp/**"],
          "deleteReferrers": false,
          "deleteUntagged": true,
          "KeepTags": [{
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
| delay | time | Remove untagged and referrers only if they are older than the specified <time\> hours, such as 24h. |
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

- A repository will apply the first policy it matches.
- If a repository matches no policy, the repository and all its tags are retained.  
- If at least one `keepTags` policy is defined for a repository, all tags not matching those policies are removed. 
- If `keepTags` is present but empty, all tags are retained.
- When multiple rules are configured, a tag is retained if it meets at least one rule.
- When you specify a regex pattern combined with one or more rules, the rules are applied only to those tags matching the regex.
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
              "repositories": ["infra/*", "prod/*"],
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