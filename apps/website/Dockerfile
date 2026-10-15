# The presentation landing: static files served by Caddy. Railway service "website", built from the repo root like the
# other services (RAILWAY_DOCKERFILE_PATH=apps/website/Dockerfile). Only the page, its images and fonts are copied: the
# README and anything else in this folder never reach the server.
FROM caddy:2.8.4-alpine
COPY apps/website/Caddyfile /etc/caddy/Caddyfile
COPY apps/website/index.html apps/website/page.css apps/website/page.js apps/website/scrollcraft.css apps/website/scrollcraft.js /srv/
COPY apps/website/img /srv/img
COPY apps/website/fonts /srv/fonts
