const cytoscape = require('cytoscape');
const cise = require('cytoscape-cise');

cytoscape.use(cise);

exports.compute = (style, graph) => {
  let cy = cytoscape({
    minZoom: 0.1,
    maxZoom: 10,
    style: style,
    elements: graph,
    layout: {
      name: 'cise',
      clusters: function (node) {
        return node.data('knowsCommunity')
      },
      animate: false,
      refresh: 10,
      animationDuration: undefined,
      animationEasing: undefined,
      fit: true,
      padding: 100,
      nodeSeparation: 2,
      idealInterClusterEdgeLengthCoefficient: 3,
      allowNodesInsideCircle: false,
      maxRatioOfNodesInsideCircle: 0.1,
      springCoeff: 0.45,
      nodeRepulsion: 4500,
      gravity: 0.25,
      gravityRange: 3.8,
      ready: function () { }, // on layoutready
      stop: function () { }, // on layoutstop
    },
    // IMPORTANT parameters here
    headless: false,
    styleEnabled: true,
  })

  return cy.json();
}
