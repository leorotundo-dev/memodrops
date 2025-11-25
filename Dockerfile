# Build minimalista para Railway
FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install and build
RUN rm -rf dist apps/*/dist && \
    npm cache clean --force && \
    npm ci --include=workspace-root && \
    npm run build --workspace=@memodrops/shared && \
    npm run build --workspace=@memodrops/ai && \
    npm run build --workspace=@memodrops/backend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@memodrops/backend"]
