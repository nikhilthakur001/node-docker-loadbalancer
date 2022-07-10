FROM node:15
WORKDIR /server
COPY package.json ./
COPY package-lock.json ./
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "dev" ]; \
  then npm ci; \
  else npm ci --production; \
  fi
COPY ./ ./
EXPOSE 3300
CMD ["node", "index.js"]