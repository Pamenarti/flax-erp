FROM node:20.11.1

WORKDIR /app

# Copy package.json and package-lock.json before other files
# Utilize Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy local files to app folder
COPY . .

# Set host to make the app accessible outside of the container
ENV HOST 0.0.0.0
ENV PORT 3000
ENV API_URL=http://88.218.130.67:3001/api
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the app
RUN npm run build

# Expose port to outside world
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
