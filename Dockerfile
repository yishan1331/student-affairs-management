FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/dashboard/package.json ./apps/dashboard/
RUN npm ci --workspace=dashboard
COPY apps/dashboard ./apps/dashboard
ENV VITE_API_URL=https://astrid-api.zeabur.app/api
RUN cd apps/dashboard && npm run build

FROM node:20-alpine AS runner
RUN npm i -g serve
COPY --from=builder /app/apps/dashboard/dist /app
EXPOSE 8080
CMD ["serve", "-s", "/app", "-l", "8080"]
