FROM nginx:1.19.7-alpine
COPY nginx.conf /etc/nginx.conf
COPY /dist/seventv-app /usr/share/nginx/html
