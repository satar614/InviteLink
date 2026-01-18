# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build || echo "No build step, using source"

# Runtime stage
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./
COPY --from=build /app/dist ./dist || true
COPY --from=build /app/public ./public || true

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "run", "server"]
