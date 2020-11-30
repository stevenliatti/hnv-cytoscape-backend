require('dotenv').config()
const fs = require('fs');
const http = require('http');
const url = require('url');
const fetch = require('node-fetch');
const myCy = require('./cytoscape')

const bHostname = process.env.BACKEND_HOSTNAME;
const bPort = process.env.BACKEND_PORT;

let map = new Map();

async function getCy(url) {
  if (map.has(url)) {
    return map.get(url);
  } else {
    const graph = await
      fetch(`http://${bHostname}:${bPort}${url}`)
      .then(res => res.json());
    const cyStyle = fs.readFileSync('cy-style.json');

    const cy = myCy.compute(JSON.parse(cyStyle), graph);
    map.set(url, cy);
    console.log(map.keys());
    return cy;
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
        res.end(JSON.stringify(cy));
        break;
      default:
        const proxyReq = http.request(`http://${bHostname}:${bPort}${req.url}`);
        proxyReq.on('response', proxyRes => {
          proxyRes.pipe(res);
        });
        req.pipe(proxyReq);
        break;
    }
  } catch (error) {
    console.error(error);
  }
});

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Server running at http://${process.env.HOSTNAME}:${process.env.PORT}/`);
});
