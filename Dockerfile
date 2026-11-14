FROM node:20-alpine
WORKDIR /app
COPY package.json server.js ./
COPY index.html results.html dir.html guestbook.html about.html settings.html ./
COPY css ./css
COPY js ./js
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
