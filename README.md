# EmailApp
A customer facing front end application developed using VueJS to send email flawlessly with the NodeJS based service in the backend that provides reliability and resilience.

The app broadly has 2 main modules, Email-client and Email-server.

## Email-client

> Email client to send emails flawlessly and is designed to be fault-tolerant.

### UI

- UI has a single form 
    - Email Form Component - to send emails

- Email Form Interaction:
    - To, cc and bcc fields expects multiple email address which are comma separated
    - e.g. john@example.com, bar@example.com


### Design

- Using material design library for layout and styles using  `vue-material`

### Validation

- Form Validation have been added vuelidate


### Build Setup

``` bash
# install dependencies
`yarn install` or `npm install`

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run unit tests
npm run unit

# run all tests
npm test
```

## Package/Containerization

- docker build -t email-server/client .
- docker run -it -p 8081:8080 --rm --name dockerize-es-client-1 email-server/client

### TODO
- Centralize error messages by using "VuelidateErrorExtractor". This will also avoid "hard coded"   messages in the components.
- improve messaging styles
- improve validations
- Can include local mixins for the reusable methods that can be shared across components. For e.g. SendEmail in this context.
- Can create more granular components for better reusablity such as "EmailComponent" as it could have been reused for "cc", "Bcc".


## Email Server - An Overview
    Email server is a backend sevice meant to provide generic service with greater abstraction to send email to cater any number of clients. In this context, the Email client is one such consumer of the service who acts as a customer-facing front-end application providing a feature to send email. Primary objective of this app is to provider better customer experience and the system is built to remain in operation even if some of the components used to build fail. Having understood the significance of this, the backend of the application has been built to provide fault-tolerant service to the front end ensuring to send emails without fail.

## Technology stack
## Service layer
NodeJS - a backend API service running as a server to send email flawlessly.
Redis - an in-memory data structure server used to switch email providers upon a failure of one.
MongoDB - to log failed emails upon multiple retries across the configured providers.

## Packaging, Deployment and Hosting layer
Docker - to easily pack, ship, and run the lightweight, portable, self-sufficient container to run anywhere
Heroku - a cloud ecosystem helps deploy, manage, and scale modern apps.


Example Email Providers:
1. SendGrid - [Documentation](https://sendgrid.com/docs/API_Reference/Web_API/mail.html)
2. Mailgun - [Documentation](http://documentation.mailgun.com/quickstart.html#sending-messages)
3. MailTrap - A fake email provider for unit and integration testing to avoid spamming real inboxes.

#### How Service works
The service broadly does the following:
1. An endpoint where users can POST data to send emails and transfer to email controller
2. The email controller pushes creates the request as job and pushes to Redis Queue.
3. A Redis worker queue that runs in the background calls an email provider to send email.
    3.a. when failed, retries for a configured number of times 
        3.a.1  When success, pops the job from the queue
        3.a.2  When failed, switch to new provider
    3.b. When email not sent despite trying out with all providers, log to MongoDB for remediation.
4. MongoDB - a collection in the DB tracks the email failure.

The implementation details are discussed in the sessions below.

#### How to run it
##### Requirements

    ### Standalone/Explicit Installation ###

    **Node.js** - The version used in this project was v12.16.0. You may be able to test using older Node.js versions.
    **Redis** - You need to have a Redis instance running in order to be able to use this service. You can set the connection details in your config file.
    **MongoDB Compass** - Any version greater than or equal to 1.23.0 is needed.

    ### Implicit Installation  ###
    **Docker Desktop** - Any latest version is needed to build image and run the app as container. No explicit installation of both NodeJS, Redis or MongoDB are needed when Docker is installed. Running the "Docker-compose.yml" takes care of everything of us.

    **Private Keys** - You need private keys from the email providers you want to use. Check the providers documentation above to find out how to get your own private keys and then put them in your config file.

##### Steps to run it locally or in your server
1. Clone the repository
2. Run `npm install` to install the dependencies
3. Optionally run `npm test` (Note: make sure to create a test.json under the configs folder). You can also simply run `mocha` if you want to run the tests using the `development.json` config file.
4. Create your test files. Usually you will need a `developement.json`, a `test.json` and/or a `production.json`.
5. Start your redis 
6. Start the service with `SET NODE_ENV=development node app.js`or `SET NODE_ENV=development pm2 app.js` (Locally you can simply run `npm start` and the default config will point to development.json)

Your service should be up and running now. You can use it by making a POST request as follows:
``` 
curl -X POST \
  http://localhost:8345/email \
  -H 'Content-Type: application/json' \
  -d '{
    "to": ["someone@gmail.com", "someone_else@gmail.com"],
    "subject": "Subject",
    "message": "Hello, this is a test"
}'
```

You can optionally add a `CC` and a `BCC` field in your request:
``` 
curl -X POST \
  http://localhost:8345/email \
  -H 'Content-Type: application/json' \
  -d '{
    "to": ["someone@gmail.com", "someone_else@gmail.com"],
    "cc": ["someone_cc@gmail.com"],
    "bcc": ["someone_bcc@gmail.com"],
    "subject": "Subject",
    "message": "Hello, this is a test"
}'
```

#### Implementation details
This session describes in more details some of the implementation details and architectural decisions for the service.

##### Input validation
This service uses input validation at a request level, i.e., if your POST request is invalid, the service won't even try to make a request to the email providers. In that scenario, you will receive an error `400 - Bad request` with an error a message, and potentially details of why your request failed. An example can be seen below for a request that is made using an invalid email.

###### Request:
```curl -X POST \
  http://localhost:8345/email \
  -H 'Content-Type: application/json' \
  -d '{
    "to": ["invalid-email"],
    "subject": "Subject",
    "message": "Hello, this is a test"
}'
```
###### Response:
```json 
{
    "code": 400,
    "message": "Bad request",
    "details": [
        {
            "path": "body.to[0]",
            "value": "invalid-email",
            "message": "should be a valid email address"
        }
    ]
}
```

##### Redis connection validation

The service requires Redis to run. The startup script will automatically end the service if a connection can't be stablished at the startup time.

#### Architectural decisions

##### Requests
If you make a POST request to the `/email` endpoint, your email may not be sent immediatelly. Instead, it will be put into a Redis queue to be processed in a later moment. A successful request will return you a response with a code `202 - Accepted`. And a body like that:
```json
{
    "code":202,
    "message":"Your email has been queued and will be sent shortly"
}
```
This means that your POST data have been converted into an emailJob and it has been stored into the Redis queue.

If you make a GET request to the `/status` endpoint, it returns the list of failed emails after multiple attempts across all the providers:

```json
[
        {"to": ["a@a.com"],
        "_id":"5fc89c324b8f4900111fe924",
        "subject":"s",
        "message":"s",
        "__v":0}]
```


##### Redis queue
The queue implemented in this service is a simple FIFO (First In, First Out). Everytime a POST request is made to `/email` the controller will format the POST data and send it to a job-manager process that will push this to the queue using the `rpush` redis command.

##### Worker
When the service initializes a worker is created to process the Redis queue. The worker consists of a `setInterval` process that controls the email dispatching process. 

The worker starts by defining one provider as the current dispatching mechanism. After setting up the dispatcher, the workers starts to pick up jobs from the queue. It will pick one job at a time and send it to the email provider. If this process is successfull, the worker will pick up the next emailJob and continue with the dispatching. If the provider returns an error, the worker will put the job back into the queue and increment an error counter for this provider. The worker will pick up the next email job and try again with the same provider. If there's another error, the worker will again put the emailJob back into the queue and again increment the error counter. If the error counter reaches a limit (defined by you in the config file) the worker will change the dispatching provider to the next one available. Only one error from a provider is not enough to make the worker change the provider (*Unless you configure the maxErrors to 1*). That is to prevent excessive changes of provider for potentially non mission critical errors. If there is an error from a provider followed by consecutive successes the error counter will diminish to a minimum of zero. So, only in the case of **X** consecutive or too frequent errors the worker will change the provider.

One assumption was made while implementing the worker, and that is that there is no preference among which provider to use. As long as they can deliver the emails, the service can use any of them interchangeably.

That wouldn't be hard to change though. The way that the worker was implemented allow us to easily migrate the provider changing heuristic to something more robust. We could potentially have a *master* provider and some *slave* ones, in that scenario the worker could prefer one provider, and in case of errors, we could put it to **_sleep_** for incremental amounts of time until the provider is responsive again. 

Another possibility that the worker implementation allow is having multiple workers running in parallel, each one of them using a different provider, and consuming from the same email queue. In this scenario, we could also have a **_sleep_** mechanism in case of multiple errors from one providers. While the erroring one sleeps, the others continue to consume the queue and dispatch emails.

##### Data loss
The data loss prevention is provided by the combination of the worker and the Redis queue. I.e, if we try to send an email with one provider and that fails, we still hold the emailData internally in our service, so we can put it back to the Redis queue and try again later. The reliability of Redis in this scenario would be incredibly high, but if we want to be extremelly cautious with data loss, we could also implement a fallback/backup database to hold the emailJobs. That way, if for some reason we can't put a job into the redis queue we could fallback to a secondary databases that the workers could also consume from.

##### Slow responses from providers
The service allows you to configure a custom timeout limit for the requests that are made to the providers. Let's say you set that limit to 5 seconds. Every time the service gets a timeout from a provider, this would be considered as an error for the worker and the error counter would be incremented. Receive **X** timeouts, and the worker would automatically change the provider to the next one available.

## Package/Containerization

## To build standalone image
docker build -t email-server/server .

## To run the build image in a container 
docker run -it -p 3000:8345 --rm --name dockerize-es-server-1 email-server/server

## To force recreate an image
docker-compose up --force-recreate


docker build -t server .
docker-compose up

## Trouble shooting
ERR! stack Error: Could not find any Python installation to use

npm install --global --production windows-build-tools

### TODO
1. Can use "NGINX" for Application Load Balancing, Acceleration, Faster Delivery and Content caching.
2. Can enforce Docker to use PM2 for better clustering so that the logical cores in the machine be effectively utilized for better performance and monitoring.

#### Continuous Delivery Pipeline for Amazon ECS Using Jenkins, GitHub, and Amazon ECR
#####Build an ECS Cluster
#####Create a Jenkins Server
Jenkins is a popular server for implementing continuous integration and continuous delivery pipelines. In this example, you'll use Jenkins to build a Docker image from a Dockerfile, push that image to the Amazon ECR registry that you created earlier, and create a task definition for your container. Finally, you'll deploy and update a service running on your ECS cluster.
#####Create an ECR Registry
Amazon ECR is a private Docker container registry that you'll use to store your container images. For this example, we'll create a repository named hello-world in the us-west-2 (Oregon) region.
#####Configure Jenkins First Run
#####Create and import SSH keys for Github
#####Bridge Git Hub Repo
