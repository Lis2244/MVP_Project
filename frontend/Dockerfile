# Этап сборки React-приложения
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Установка react-icons
RUN npm install react-icons

COPY . .

RUN npm run build

# Используем nginx для сервировки собранного приложения
FROM nginx:alpine

# Копируем собранное приложение в директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Отключение кеширования в Nginx через конфигурацию
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        add_header Pragma "no-cache"; \
        add_header Expires 0; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
