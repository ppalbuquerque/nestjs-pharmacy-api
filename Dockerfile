FROM node:20-alpine3.22 AS builder

RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# RUN npm run build

# FROM node:18-alpine3.18 AS development

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /app

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 3000

# CMD ["npm", "run", "start:dev"]