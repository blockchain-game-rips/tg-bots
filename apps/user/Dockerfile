FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json tsconfig.build.json ./
COPY openapi-ts.config.ts open-api.json ./
COPY src/ ./src/

RUN yarn openapi-ts && yarn build

CMD ["yarn", "start"]
