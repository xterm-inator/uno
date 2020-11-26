FROM node:carbon

# Copy across the "package.json" and "yarn.lock" files to install dependencies.
RUN mkdir -p /opt/app
COPY package.json package-lock.json /opt/

# Install dependencies
RUN cd /opt && npm i

# Define the path to the "node_modules" directory.
ENV NODE_PATH /opt/node_modules
ENV PATH /opt/node_modules/.bin:$PATH

# Copy the entire application into our application directory.
COPY . /opt/app

# Set the working directory, expose the port NPM runs on, and run the dev command.
WORKDIR /opt/app
EXPOSE 8080

CMD ["npm", "run", "serve"]
