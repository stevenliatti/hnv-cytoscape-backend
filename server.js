require('dotenv').config();
const fs = require('fs');
const http = require('http');
const fetch = require('node-fetch');
const Redis = require('ioredis');
const myCy = require('./cytoscape');

const bHostname = process.env.BACKEND_HOSTNAME;
const bPort = process.env.BACKEND_PORT;

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOSTNAME,
  family: 4,
  password: process.env.REDIS_PASSWORD,
  db: 0,
});
const cyStyle = fs.readFileSync('cy-style.json');

async function getCy(url) {
  try {
    const exists = await redis.exists(url);
    if (exists != 0) {
      const cy = await redis.get(url);
      console.log('CACHE GET', url);
      return cy;
    } else {
      const graph = await fetch(`http://${bHostname}:${bPort}${url}`).then(res => res.json());
      const cy = JSON.stringify(myCy.compute(JSON.parse(cyStyle), graph));
      redis.set(url, cy);
      console.log('CACHE SET', url);
      return cy;
    }
  } catch (error) {
    console.error(error);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.includes('/graph/actors') || req.url.includes('/graph/shortestPath')) {
      const cy = await getCy(req.url);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(cy);
    }
    else {
      const proxyReq = http.request(`http://${bHostname}:${bPort}${req.url}`);
      proxyReq.on('response', proxyRes => {
        res.statusCode = proxyRes.statusCode;
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
        proxyRes.pipe(res);
      });
      req.pipe(proxyReq);
    }
  } catch (error) {
    console.error(error);
  }
});

server.listen(process.env.CYTOSCAPE_PORT, process.env.CYTOSCAPE_HOSTNAME, () => {
  console.log(`Server running at http://${process.env.CYTOSCAPE_HOSTNAME}:${process.env.CYTOSCAPE_PORT}/`);
});
