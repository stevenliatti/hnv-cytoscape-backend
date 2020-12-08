FROM node:alpine
WORKDIR /home/node/cytoscape-backend
COPY . .
RUN npm ci --production
CMD npm start
USER node