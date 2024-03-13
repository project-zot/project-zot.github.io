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
