# Этап сборки React-приложения
FROM node:16-alpine as build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Устанавливаем react-icons
RUN npm install react-icons

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build || (echo "Build failed" && exit 1)

# Используем nginx для сервировки собранного приложения
FROM nginx:alpine

# Копируем собранное приложение в директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Конфигурация Nginx
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
    error_page 404 /index.html; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80