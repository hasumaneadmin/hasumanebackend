FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm ci --workspace=frontend --workspace=backend

FROM deps AS build
WORKDIR /app
COPY . .
RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build --workspace=frontend
RUN npm run build --workspace=backend

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy all build artifacts and node_modules directly to runtime stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/frontend/node_modules ./frontend/node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/package*.json ./
COPY --from=build /app/frontend/package*.json ./frontend/
COPY --from=build /app/backend/package*.json ./backend/
COPY --from=build /app/scripts/start-production.js ./scripts/start-production.js

EXPOSE 3000
CMD ["node", "scripts/start-production.js"]
