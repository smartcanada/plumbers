FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# We install dependencies if package.json exists, otherwise we wait for the user to init
RUN if [ -f package.json ]; then npm install; fi

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]