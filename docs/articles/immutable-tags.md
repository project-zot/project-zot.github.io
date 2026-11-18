# Immutable Image Tags

> :point_right: Immutable image tag support is achieved by leveraging authorization policies.

It is considered best practice to avoid changing the content once a software
version has been released. While `zot` does not have an explicit configuration
flag to make image tags immutable, the same effect can be achieved with
[authorization](../articles/authn-authz.md) as follows.

## Immutable For All Users

By setting the `defaultPolicy` to "read" and "create" for a particular
repository, images can be pushed (once) and pulled but further updates are
rejected.

```json
{
...
  "repositories": {
    "**": {
      "defaultPolicy": ["read", "create"]
    }
  }
...
}
```

## Immutable With Overrides

As in the example above, with `defaultPolicy` set to "read" and "create" for a
particular repository, images can be pushed (once) and pulled, but further
updates are rejected. Exceptions can be made for some users, and user-specific
policies can be added to allow "update" operations as shown below.

```json
{
...
  "repositories": {
    "**": {
      "policies": [{
        "users": ["alice", "bob"],
        "actions": ["read", "create", "update"]
      }],
      "defaultPolicy": ["read", "create"]
    }
  }
...
}
```

## Selected Tags

The repository policy above freezes every tag. To let some users retarget ordinary tags while `prod`, `latest`, `release-*`, and `v1.2.3`-style tags stay fixed, grant `update` and `delete` only on a policy entry whose condition rejects those tag names. `defaultPolicy` stays `read` and `create`. It has no conditions, so putting `update` or `delete` there would allow the change for every authenticated user.

```json
{
  "http": {
    "accessControl": {
      "repositories": {
        "**": {
          "policies": [
            {
              "users": ["alice", "bob"],
              "actions": ["read", "create", "update", "delete"],
              "conditions": [
                {
                  "expression": "(req.action != \"update\" && req.action != \"delete\") || !(req.tag in [\"prod\", \"latest\"] || req.tag.startsWith(\"release-\") || req.tag.matches('^v[0-9]+[.][0-9]+[.][0-9]+$'))",
                  "message": "tag is immutable"
                }
              ]
            }
          ],
          "defaultPolicy": ["read", "create"]
        }
      }
    }
  }
}
```

Alice can push `prod` the first time, push and retarget `dev` or `v1.2`, and cannot retarget or delete `prod`, `latest`, `release-1`, or `v1.2.3`. A digest push with `?tag=prod` is rejected the same way. The response is `403`, and `message` is returned as the deny reason. Pushing the same manifest bytes again is an update, so that retry is rejected too.

A `DELETE` of the manifest by digest has an empty `req.tag`, so the condition does not apply to it. Alice can still remove `prod` that way. To block every delete, including delete by digest, omit `delete` from the policy, as in the repository-wide example above.

`adminPolicy` is checked after the repository policy. An admin whose actions include `update` or `delete` can still change these tags. Leave those actions off `adminPolicy` when the tags must stay fixed for administrators too. This policy applies to client requests. Sync and retention run inside the registry and are not limited by it.
