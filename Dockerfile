# Build minimalista para Railway
FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install and build
RUN npm cache clean --force && npm ci --include=workspace-root && npm run clean && \
    npm run build --workspace=@memodrops/shared && \
    npm run build --workspace=@memodrops/ai && \
    npm run build --workspace=@memodrops/backend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@memodrops/backend"]
