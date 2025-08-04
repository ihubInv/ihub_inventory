# Stage 1: Build React App with Node 20.19.4
FROM node:20.19.4 as build

WORKDIR /app

COPY package*.json ./
COPY .env .             
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 1700

CMD ["nginx", "-g", "daemon off;"]
