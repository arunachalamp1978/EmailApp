# build environment
FROM node:12.2.0-alpine as build

RUN npm install -g http-server
WORKDIR /app/client
ENV PATH /app/client/node_modules/.bin:$PATH

COPY ./source/package*.json ./
RUN npm install vue-material@beta --save 
RUN npm install 
##--silent
COPY ./source .

RUN npm run build

EXPOSE 8081
CMD [ "http-server", "dist" ]



# production environment
# FROM nginx:1.16.0-alpine
# COPY --from=build /app/client/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]