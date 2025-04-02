# pacman-js/Dockerfile
FROM node:18 as build

WORKDIR /app
COPY pacman-js/package*.json ./
RUN npm install

COPY pacman-js ./
RUN npm run build

# Use a lightweight static server
FROM node:18-slim
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist /app/dist
EXPOSE 1234
CMD ["http-server", "dist", "-p", "1234"]
