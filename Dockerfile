FROM node:16.13.2
WORKDIR /
RUN git clone --depth=1 https://github.com/joyent/node-docker-registry-client.git && \
    cd /node-docker-registry-client && \
    npm install

WORKDIR /work
COPY ./package.json /work/package.json
COPY ./package-lock.json /work/package-lock.json
COPY .eslintignore /work/.eslintignore
COPY .eslintrc.json /work/.eslintrc.json
COPY jest.config.js /work/jest.config.js
COPY tsconfig.json /work/tsconfig.json
COPY tsconfig.release.json /work/tsconfig.release.json
COPY .prettierrc /work/.prettierrc
COPY ./src/ /work/src/
RUN npm install
RUN NODE_ENV=production npm run build

CMD [ "npm", "start" ]
