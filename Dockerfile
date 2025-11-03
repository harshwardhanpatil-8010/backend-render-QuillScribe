FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies in a separate stage for better caching
FROM base AS dependencies
COPY package*.json ./
# Use npm ci for clean, reproducible installs in production
RUN npm ci

# Final production stage
FROM base AS final

# Copy only production dependencies from the previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Run as a non-root user for better security
USER node

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port the app runs on
EXPOSE 5000

# The command to start the application
CMD ["node", "server.js"]