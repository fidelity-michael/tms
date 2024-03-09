# -------------- STAGE 1: Build --------------

FROM node:21-alpine3.17
LABEL maintainer="Michael K."

# set working directory
WORKDIR /tms-frontend
# add `/frontend/node_modules/.bin` to $PATH
ENV PATH /tms-frontend/node_modules/.bin:$PATH

# install and cache app dependencies
# RUN npm create vite@latest . -- --template react-ts
# RUN npm install -D tailwindcss postcss autoprefixer
# RUN npx tailwindcss init -p

# COPY package.json /tms-frontend/package.json

# add app
COPY . /tms-frontend
RUN npm install

# -------------- STAGE 2: Run --------------

CMD [ "sh", "-c", "npm run dev" ]
