FROM node:12-alpine as BUILDAPP

# Define working directory
WORKDIR /app
COPY . /app

# Build the app
RUN npm install
RUN npm run build

RUN echo PagMan!
