FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM deps AS build
COPY prisma ./prisma
COPY nest-cli.json tsconfig*.json ./
COPY src ./src
COPY scripts ./scripts
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy NestJS production dependencies and built server
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/scripts ./scripts
COPY frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["node", "scripts/start-production.js"]
