FROM node:dubnium-buster as builder

COPY . /src
WORKDIR /src
RUN npm install && npm run build --prod


FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/
COPY --from=builder /src/dist /files/dist
