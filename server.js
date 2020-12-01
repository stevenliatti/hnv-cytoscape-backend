require('dotenv').config();
const fs = require('fs');
const http = require('http');
const url = require('url');
const fetch = require('node-fetch');
const Redis = require('ioredis');
const myCy = require('./cytoscape');

const bHostname = process.env.BACKEND_HOSTNAME;
const bPort = process.env.BACKEND_PORT;

const redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME);
const cyStyle = fs.readFileSync('cy-style.json');

async function getCy(url) {
  try {
    const exists = await redis.exists(url);
    if (exists != 0) {
      const cy = await redis.get(url);
      return cy;
    } else {
      const graph = await fetch(`http://${bHostname}:${bPort}${url}`).then(res => res.json());
      const cy = JSON.stringify(myCy.compute(JSON.parse(cyStyle), graph));
      redis.set(url, cy);
      console.log('set url', url);
      return cy;
    }
  } catch (error) {
    console.error(error);
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = url.parse(req.url, true);
  console.log(req.url)

  const startPath = reqUrl.path.split('/')[1];
  try {
    switch (startPath) {
      case 'graph':
        const cy = await getCy(req.url);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(cy);
        break;
      default:
        const proxyReq = http.request(`http://${bHostname}:${bPort}${req.url}`);
        proxyReq.on('response', proxyRes => {
          res.statusCode = proxyRes.statusCode;
          res.setHeader('Content-Type', proxyRes.headers['content-type']);
          proxyRes.pipe(res);
        });
        req.pipe(proxyReq);
        break;
    }
  } catch (error) {
    console.error(error);
  }
});

server.listen(process.env.CYTOSCAPE_PORT, process.env.CYTOSCAPE_HOSTNAME, () => {
  console.log(`Server running at http://${process.env.CYTOSCAPE_HOSTNAME}:${process.env.CYTOSCAPE_PORT}/`);
});
