FROM golang:buster as build-img-merger


# build imgMerger binaries
COPY imgMerger /imgMerger
RUN make -C /imgMerger/src


FROM circleci/node:latest-browsers
USER root
WORKDIR /csgo-dof-screenshot


# node_modules
COPY package.json .
COPY npm-shrinkwrap.json .
RUN npm install
RUN npm outdated
RUN date +%s | xargs test 1595789923 -gt || npm audit


# do a first build to prevent electron-builder 'download' stage during  the actual build
WORKDIR /csgo-dof-screenshot/app
RUN wget -q https://raw.githubusercontent.com/electron/electron-quick-start/master/main.js
WORKDIR /csgo-dof-screenshot
RUN npx electron-builder
RUN rm -r app
RUN rm -r dist


# build
COPY app app
COPY gui gui
RUN mkdir extraResources
COPY --from=0 /imgMerger/bin/imgMerger extraResources/imgMerger
RUN npm run build


# build test
COPY test test
RUN npm run build-test


# test
CMD npm run test