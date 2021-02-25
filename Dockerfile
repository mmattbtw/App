FROM node:12-alpine as BUILDAPP

# Define working directory
WORKDIR /app
COPY . /app

# Build the app
RUN npm install
RUN npm run build

# Get typings
RUN apk add git
RUN git clone https://github.com/SevenTV/Typings.git

RUN echo PagMan!
