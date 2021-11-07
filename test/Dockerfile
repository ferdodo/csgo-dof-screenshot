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
RUN npm audit --audit-level=critical


# do a first build to prevent electron-builder 'download' stage during  the actual build
WORKDIR /csgo-dof-screenshot/electron-main
RUN wget -q https://raw.githubusercontent.com/electron/electron-quick-start/master/main.js
WORKDIR /csgo-dof-screenshot
RUN npx electron-builder
RUN rm -r electron-main
RUN rm -r dist


# build
COPY electron-main electron-main
COPY electron-renderer electron-renderer
RUN mkdir extraResources
COPY --from=0 /imgMerger/bin/imgMerger extraResources/imgMerger
RUN npm run build


# build test
COPY test test
RUN npm run build-test


# test
CMD npm run test
