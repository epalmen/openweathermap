FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock.json to working directory
COPY package*.json ./
RUN npm install

# Copy the app source files
COPY . .

# Expose default port 9100 and start the application
EXPOSE 9100
CMD ["node", "app.js"]

