# Stage 1: Build
# Use an official Node.js runtime as a parent image. We use a specific version for reproducibility.
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# This step will only be re-run if these files change.
COPY package*.json ./

# Install production dependencies using npm ci for a clean, reliable build
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Stage 2: Production
# Use a smaller, more secure base image for the final production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependencies and source code from the 'base' stage
COPY --from=base /usr/src/app .

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Chown the uploads directory if it exists, so the app can write to it
RUN mkdir -p uploads && chown -R appuser:appgroup uploads

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 5000

# The command to start the application
CMD ["node", "server.js"]
