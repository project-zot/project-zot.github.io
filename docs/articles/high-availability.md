# Deploying a Highly Available zot Registry

> :point_right: A highly available zot registry can be easily implemented using zot's registry synchronization feature.

In the zot configuration, the `sync` extension allows a zot instance to mirror another zot instance with various container image download policies, including on-demand and periodic downloads. You can use the zot `sync`  function combined with a load balancer such as [HAProxy](https://www.haproxy.com) to implement a highly available registry.

Two failover configurations are possible:

* Active/standby

    Registry requests are sent by the load balancer to the active zot instance, while a standby instance mirrors the active. If the load balancer detects a failure of the active instance, it then sends requests to the standby instance.

* Active/active

    Registry requests are load-balanced between two zot instances, each of which mirrors the other.

> :pencil2: The highly available zot registry described in this article differs from [zot clustering](clustering.md). Although zot clustering provides a level of high availability, the instances share common storage, whose failure would affect all instances. In the method described in this article, each instance has its own storage, providing an additional level of safety.

For details of configuring the `sync` extension, see [OCI Registry Mirroring With zot](mirroring.md).


## Configuring an active/standby registry

An active/standby zot registry can be implemented between two zot instances by configuring the `sync` extension in the standby instance to mirror the other instance.  In this scheme:

* a load balancer such as HAProxy is deployed for active/passive load balancing of the zot instances
* each zot instance is configured as a standalone registry with its own storage
* the standby zot instance has its `sync` extension enabled to periodically synchronize with (mirror) the active instance

With periodic synchronization, a window of failure exists between synchronization actions. For example, if an image is posted to the active instance soon after the standby has synchronized with the active, and then the active fails, the standby will not have the new image. To minimize this exposure, we recommend keeping the synchronization period as small as practical.

## Configuring an active/active registry

An active/active zot registry can be implemented between two zot instances by configuring the `sync` extension in each instance to point to the other instance.  In this scheme:

* a load balancer such as HAProxy or a [DNS-based routing](https://coredns.io/plugins/loadbalance/) scheme is deployed for load balancing between zot instances
* [path-based routing](https://www.haproxy.com/blog/path-based-routing-with-haproxy) must be implemented 
* each zot instance is configured as a standalone registry with its own storage
* each zot instance has its `sync` extension enabled to periodically synchronize with the other instance

With periodic synchronization, a window of failure exists between synchronization actions. For example, if an image is posted to instance A soon after instance B has synchronized with instance A, and then instance A fails, instance B will not have the new image.  To minimize this exposure, we recommend keeping the synchronization period as small as practical.
