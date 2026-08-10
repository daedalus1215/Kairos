# Multi-stage: the TypeScript toolchain never reaches the shipped image.
FROM node:22-alpine AS build
WORKDIR /app
# package files first — this layer caches until dependencies actually change.
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# Migrations are .ts under src/ but compiled into dist/ by nest build, and
# app.module.ts points TypeORM at __dirname — so migrationsRun finds them here.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
