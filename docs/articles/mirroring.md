# Setup OCI Registry Mirror Using `zot`

One of the key use cases that zot enables is mirroring which uses the `sync` feature.
As long as upstream registries are OCI dist-spec conformant with regards to
pulling image content, we can use `zot` as a downstream mirror.

Similar to git where every clone is a full repository, you can setup a local
zot instance to be a full OCI registry and allows for a fully distributed
disconnected container image build pipeline.

OCI images and corresponding artifacts can move from one registry to another.

# Single Upstream

https://github.com/project-zot/zot/blob/main/examples/config-sync-localhost.json

# Multiple Upstream

https://github.com/project-zot/zot/blob/main/examples/config-sync.json

# `dockerhub` Mirror

Polling is not supported since dockerhub doesn't support catalog listing. So only on-demand is supported.

# `subPaths` Support

# Configuration Params


		"sync": {
			"enable": true,
			"credentialsFile": "./examples/sync-auth-filepath.json",
			"registries": [
				{
					"urls": [
						"https://registry1:5000"
					],
					"onDemand": false,
					"pollInterval": "6h",
					"tlsVerify": true,
					"certDir": "/home/user/certs",
					"maxRetries": 3,
					"retryDelay": "5m",
					"onlySigned": true,
					"content": [
						{
							"prefix": "/repo1/repo",
							"tags": {
								"regex": "4.*",
								"semver": true
							}
						},
						{
							"prefix": "/repo1/repo",
							"destination": "/repo",
							"stripPrefix": true
						},
						{
							"prefix": "/repo2/repo"
						}
					]
