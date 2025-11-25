# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN npm install --include=workspace-root

# Copy source code
COPY . .

# Build shared package first
RUN npm run build --workspace=@memodrops/shared

# Build backend
RUN npm run build --workspace=@memodrops/backend

# Expose port
EXPOSE 3000

# Start backend
CMD ["npm", "run", "start", "--workspace=@memodrops/backend"]
