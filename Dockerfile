FROM node:16-alpine as builder

WORKDIR /src

COPY package.json ./
COPY yarn.lock ./

RUN yarn
COPY . .
RUN yarn build

# production stage
FROM nginx:stable-alpine as prod
COPY --from=builder /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/


CMD ["nginx", "-g", "daemon off;"]
