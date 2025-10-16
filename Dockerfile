FROM node:20-alpine3.22 AS base
RUN apk add --no-cache bash
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

FROM node:20-alpine3.22 AS dev
COPY package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM base AS prod
WORKDIR /app
COPY package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]