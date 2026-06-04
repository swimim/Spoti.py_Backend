FROM node:24-alpine as build
WORKDIR /app

COPY package*.json .
RUN npm i

COPY . .

RUN npm run build

FROM node:24-alpine as production
WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD [ "node", "dist/src/main" ]