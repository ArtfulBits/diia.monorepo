FROM node:18-alpine as builder

WORKDIR /usr/src/app

RUN apk add --no-cache protoc

# Accept registry URL as a build argument
ARG NPM_REGISTRY_URL

# Copy package.json and package-lock.json
# COPY package*.json ./ & the source code
COPY package.json ./
COPY ./src ./src 
COPY ./protos ./protos 
COPY ./tsconfig*.json ./ 

# Set npm registry to the provided URL & Install production dependencies.
RUN if [ -n "$NPM_REGISTRY_URL" ]; then \
    echo "Setting NPM registry to ${NPM_REGISTRY_URL}"; \
    npm config set registry $NPM_REGISTRY_URL; fi && \
    npm install

# Build the project
RUN npm run build

# Start a new stage from scratch
FROM node:18-alpine as runtime

WORKDIR /usr/src/app

# Copy the built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/protos ./protos
COPY --from=builder /usr/src/app/package*.json ./

# TODO: copy SSL certificate and key into the container, expected cert.pem and key.pem names

# Expose the port the app runs on
EXPOSE 50051

# Run the service
CMD [ "node", "dist/index.js" ]
