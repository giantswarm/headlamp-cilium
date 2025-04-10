# Dockerfile
# Stage 1: Build the headlamp-cilium plugin
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /plugin

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the plugin source code
COPY . .

# Build the plugin using the headlamp-plugin tool
# This creates the necessary files in the /plugin/dist directory
RUN npm run build

# Stage 2: Create the final image containing only the built plugin artifacts
FROM alpine:latest

# Create the directory structure expected by Headlamp (/plugins/<plugin-folder-name>)
# Use the name from package.json
ARG PLUGIN_NAME=headlamp-cilium
RUN mkdir -p /plugins/${PLUGIN_NAME}

# Copy the built plugin files (dist/) and package.json from the builder stage
COPY --from=builder /plugin/dist/ /plugins/${PLUGIN_NAME}/
COPY --from=builder /plugin/package.json /plugins/${PLUGIN_NAME}/

# Optional: Set permissions if needed, though typically handled by volume mounts/Headlamp itself
# RUN chown -R <someuser>:<somegroup> /plugins

# No CMD or ENTRYPOINT needed, this image just holds files. 