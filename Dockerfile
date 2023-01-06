# stage 1 — deploy
FROM nginx:latest

# copy nginx config for react-router compatibility
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy static files from last stage
COPY ./build /usr/share/nginx/html

EXPOSE 80