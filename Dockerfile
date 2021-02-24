FROM node:12 as BUILDAPP

# Define working directory
WORKDIR /app

# Build the app
RUN npm install
RUN npm run build

RUN echo PagMan!
