FROM node:alpine
WORKDIR /home/node/smartrub
COPY . .
RUN npm ci --production
CMD npm start
USER node