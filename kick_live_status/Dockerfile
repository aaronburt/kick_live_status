FROM node:26-alpine

LABEL \
    io.hass.name="Kick Live Status" \
    io.hass.description="Monitor Kick.com streamers and expose their live status as Home Assistant sensors" \
    io.hass.type="addon" \
    io.hass.version="1.2.12"

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY index.js ./

CMD ["node", "index.js"]
