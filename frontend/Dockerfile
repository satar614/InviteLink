# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files from frontend directory (when building from repo root)
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./
RUN npm run build || echo "No build step, using source"

# Runtime stage
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "server"]
