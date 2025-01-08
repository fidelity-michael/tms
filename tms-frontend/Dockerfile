# -------------- STAGE 1: Build --------------

FROM node:21-alpine3.17
LABEL maintainer="Michael K."

# set working directory
WORKDIR /tms-frontend
# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /tms-frontend/node_modules/.bin:$PATH

# Install all dependencies
COPY package.json .
RUN npm install

COPY . /tms-frontend

# -------------- STAGE 2: Run --------------

CMD [ "sh", "-c", "npm run start" ]
