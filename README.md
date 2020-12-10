# HNV Cytoscape backend

Used in [Hollywood Network Visualizer](https://github.com/stevenliatti/hollywood-network-visualizer).

Cytoscape proxy, cache the results of CiSE computation in redis. To deploy between [hnv-backend](https://github.com/stevenliatti/hnv-backend) and [hnv-frontend](https://github.com/stevenliatti/hnv-frontend).

You have to deploy hnv-backend and a redis instance first, and next create a `.env` file like this :

```conf
CYTOSCAPE_HOSTNAME=127.0.0.1
CYTOSCAPE_PORT=3000
BACKEND_HOSTNAME=127.0.0.1
BACKEND_PORT=8080
REDIS_HOSTNAME=127.0.0.1
REDIS_PORT=6379
```
