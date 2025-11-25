# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN npm install --include=workspace-root

# Copy source code
COPY . .

# Build backend
RUN npm run build --workspace=@memodrops/backend

# Expose port
EXPOSE 3000

# Start backend
CMD ["npm", "run", "start", "--workspace=@memodrops/backend"]
