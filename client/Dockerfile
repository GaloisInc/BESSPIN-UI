FROM node:lts-alpine AS builder

# create app directory
WORKDIR /besspin-ui/client
RUN mkdir /besspin-ui/client/dist
RUN chmod 777 /besspin-ui/client/dist

RUN npm up -g npm

# install deps
# NOTE: we are a subdirectory of the UI project
#       as such, you must build this from the parent
#       directory so when we run docker-compose, it
#       can also use this Dockerfile
COPY client/package.json .
COPY client/package-lock.json .

RUN npm install

COPY client/ .

# TODO: when we have this set up for production
# RUN npm run build && npm prune --production

FROM node:lts-alpine

WORKDIR /besspin-ui/client

COPY --from=builder /besspin-ui/client/node_modules /besspin-ui/client/node_modules
COPY --from=builder /besspin-ui/client/package.json /besspin-ui/client/package.json
COPY --from=builder /besspin-ui/client/public /besspin-ui/client/public
COPY --from=builder /besspin-ui/client/.env /besspin-ui/client/.env
COPY --from=builder /besspin-ui/client/dist /besspin-ui/client/dist
# TODO: if we want this image to be production-only we will need to build a dev version
#       that includes the below files/directories
COPY --from=builder /besspin-ui/client/tsconfig.json /besspin-ui/client/tsconfig.json
COPY --from=builder /besspin-ui/client/src /besspin-ui/client/src

# I _think_ this is only needed while working in development mode
RUN npm rebuild node-sass

ENV NODE_ENV development
ENV HOST 0.0.0.0

EXPOSE 3000
EXPOSE 9229

CMD ["npm", "run", "start"]