const fs = require('fs');
const http = require('http');
// const url = require('url');
const fetch = require('node-fetch');
const myCy = require('./cytoscape')

const hostname = '127.0.0.1';
const port = 3000;

let map = new Map();

async function getCy(url) {
  if (map.has(url)) {
    return map.get(url);
  } else {
    const graph = await fetch(`http://localhost/api${url}`).then(res => res.json());
    const cyStyle = fs.readFileSync('cy-style.json');

    const cy = myCy.compute(JSON.parse(cyStyle), graph);
    map.set(url, cy);
    return cy;
  }
}

const server = http.createServer(async (req, res) => {
  // const reqUrl = url.parse(req.url, true);
  console.log(req.url)
  console.log(map.keys());

  try {
    const cy = await getCy(req.url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(cy));
  } catch (error) {
    console.error(error);
  }

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
