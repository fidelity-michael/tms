# -------------- STAGE 1: Install Dependencies and copy project --------------
FROM node:21-alpine3.17
LABEL maintainer="Michalis K."

# set working directory
WORKDIR /tms-backend
# add `/backend/node_modules/.bin` to $PATH
ENV PATH /tms-backend/node_modules/.bin:$PATH

# install and cache backend dependencies
COPY package.json /tms-backend/package.json
RUN npm install

# add backend source
COPY . /tms-backend

# -------------- STAGE 2: Run --------------

# Run npm script
CMD ["sh", "-c", "npm run dev"]
