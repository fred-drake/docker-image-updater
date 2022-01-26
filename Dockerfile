FROM node:16.13.2 as base
WORKDIR /
RUN git clone --depth=1 https://github.com/joyent/node-docker-registry-client.git && \
    cd /node-docker-registry-client && \
    npm install

FROM base as development
WORKDIR /workspace
RUN npm install -g jest

FROM base as builder
WORKDIR /workspace
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install
COPY .eslintignore ./.eslintignore
COPY .eslintrc.json ./.eslintrc.json
COPY jest.config.js ./jest.config.js
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.release.json ./tsconfig.release.json
COPY .prettierrc ./.prettierrc
COPY ./src/ ./src/
COPY ./__tests__ ./__tests__
RUN npm run lint --if-present
RUN npm test
RUN npm run build --if-present

FROM base
WORKDIR /work
COPY --from=builder /workspace/package.json /work/package.json
COPY --from=builder /workspace/package-lock.json /work/package-lock.json
COPY --from=builder /workspace/build/ /work/build/
RUN NODE_ENV=production npm install


CMD [ "npm", "start" ]
