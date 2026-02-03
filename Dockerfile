# Stage 1: Build client
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/package.json ./
COPY --from=server-build /app/server/prisma ./prisma
COPY --from=client-build /app/client/dist ./public

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
