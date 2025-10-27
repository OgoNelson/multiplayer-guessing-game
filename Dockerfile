# ---------- Stage 1: Build the frontend ----------
FROM node:22 AS builder

# Set working directory
WORKDIR /app/client

# Copy client dependency files first (for caching)
COPY client/package*.json ./

# Install frontend dependencies (includes Vite)
RUN npm install

# Copy all client source code
COPY client/ .

# Build the frontend (output -> client/dist)
RUN npm run build


# ---------- Stage 2: Setup backend ----------
FROM node:22 AS server

WORKDIR /app

# Copy backend dependency files
COPY package*.json ./

# Install backend dependencies
RUN npm install --omit=dev

# Copy backend code
COPY server/ .

# Copy built frontend from builder stage
COPY --from=builder /app/client/dist ./public

# Expose the port your app listens on
EXPOSE 3000

# Start the server
CMD ["node", "server/app.js"]
