# serverless-service
The repository for video streaming traffic control.  
The service limits the number of streams allocated to each user.  
It acts as a gatekeeper to creating new streams.

# Implementation
  Implementation is guided by the famous serverless architecture.  
  Under the hood is just lambda function that can be triggered by API Gateway or AppSync  
  This lambda function takes an input as an event and return an output.  

  Lambda + API Gateway = REST API/HTTP API (v1/v2)  
  Lambda + AppySync = GraphQL API

# Scaling
  Lambda scales automatically as the demand increase.  
  There are some limitations to its auto scaling though.  
  By default, it can go up to 1000 instances.  
  It can go beyond 1000, but not without requesting that from AWS.  
  There is also a memory limit of 10,240 MB  
  That means, it needs to be monitored everytime.  
  CloudWatch is a good service that integrates easily with lambda to monitor different metrics and set alarms.

# Testing And Deploying
  It can be tested locally.  
  It can also be deployed and tested on AWS cloud.

# Install And Testing Locally
For a lambda function to run, it must be triggered by an event.  
Bad news is, it can't be triggered by http event locally.  
Good news is, serverless can still invoke it locally and pass an event to it.  
That is enough to test how it will process different events once it is deploy.  
A local DynamoDB instance is also needed to handle database queries from the lambda.


Step 1: Install Node.js
  * Install node.js
  * Version 12.x is enough to excute the processes, but the latest stable version is much better.  
  [Node.js can be downloaded her](https://nodejs.org/)

Step 2: Set up DynamoDB locally
   * Instasll docker for desktop
   * Run the following commands on your terminal or command prompt to pull and start a dynamodb docker image  
   ```sh
     docker pull amazon/dynamodb-local
   ```  
   ```sh
     docker run -p 8000:8000 amazon/dynamodb-local
   ```

Step 3: Install a dynamoDB UI web app that will help you to create and delete tables
  * Run npm install -g dynamodb-admin on your terminal or command prompt  
   ```sh
     npm install -g dynamodb-admin
   ```

Step 4: Start dynamoDB UI web app
  * Details to be used on the commnad below  
  ```json
    {
      "endpoint": "http://localhost:8000",
      "accessKeyId": "testKeyId",
      "secretAccessKey": "testSecretAccessKey",
      "region": "eu-central-1"
    }
  ```  
  Mac or Linux  
  ```
     DYNAMO_ENDPOINT=http://localhost:[<PORT>]AWS_REGION=[<AWS-REGION>] AWS_ACCESS_KEY_ID=[<YOUR-ACCESS-KEY>] AWS_SECRET_ACCESS_KEY=[<YOUR-SECRET>] dynamodb-admin
  ```  
  Windows  
  ```
    export DYNAMO_ENDPOINT=http://localhost:[<PORT>]
    .
    .
    .
    dynamodb-admin
  ```

_Note: Leave step 2 and Step 4 running. Otherwise you won't be able to access them._
     

Step 5: View dynamoDB UI web app using web browser  
 * Go to http://localhost:8001 or whatever port number you see on your terminal on Step 4
 * Create table  `active-stream-dev` using the following schema. You need it to test the service  
 ```json
        {
            "AttributeDefinitions": [
                {
                "AttributeName": "userId", 
                "AttributeType": "S"
            }], 
            "KeySchema": [
                {
                "AttributeName": "userId", 
                "KeyType": "HASH"
            }], 
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 5, 
                "WriteCapacityUnits": 5
            }, 
            "TableName": "active-stream-dev"
        }
```  
Step 6: Clone the repository to your local machine using
  * Run `git clone` on your terminal or command prompt 
   ```sh
     git clone <link>
   ```


Step 7:
  * Run `npm install` on your terminal or command prompt to install all the dependences.

  Windows
  ```sh
    npm i 
  ```
  Mac
  ```sh
    sudo npm i 
  ```

Step 8:
  * Run `npm run local:api` on your terminal or command prompt to invoke the function 
Step 9:
  * Check the request.json file under /events folder. Thats where the expected event is.
   You can play around with it, like running the lambda with the same user many times, change userId and so on...


# Deploying
  Deploying manually using serverless is quick. It takes a few commands

   A command to config AWS credentials:  
   ```sh
       serverless config credentials --provider aws --key [<YOUR-ACCESS-KEY>] --secret [<YOUR-SECRET>]
   ```

   And a command to deploy:  
   ```sh
       serverless deploy -s dev -c serverless.yml
   ```

  [You can find more information here](https://www.serverless.com/framework/docs/providers/aws)

