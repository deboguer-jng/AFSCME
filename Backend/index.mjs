import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "afscme-registration";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "GET /users":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = {'statusCode' : statusCode ,  'data' :  body.Items};
        break;
      case "GET /states":
        const uniqueStates = new Set();
        body = await dynamo.send(
          new ScanCommand({
            TableName: "affiliate_state",
            ProjectionExpression: "#sn",
            ExpressionAttributeNames: {
                "#sn": "state_name" 
            }
        }));
        body.Items.forEach(item => {
            if (item.state_name) {
                uniqueStates.add(item.state_name);
            }
        });
        body = {'statusCode' : statusCode ,  'data' :  Array.from(uniqueStates)};
        break;
      case "GET /affiliations":
        let selectedState = event.queryStringParameters.state;
        const input = {
          "TableName": "affiliate_state",
          "KeyConditionExpression": "#kn0 = :kv0",
          "ExpressionAttributeNames": {
            "#kn0": "state_name"
          },
          "ExpressionAttributeValues": {
            ":kv0": selectedState
          },
          "Select": "ALL_ATTRIBUTES"
        };

        
        let data = await dynamo.send(
          new QueryCommand(input)
        );
        body = {'statusCode' : statusCode ,  'data' : data.Items };
        break;
      case "POST /users":
        let addrequestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: addrequestJSON.id,
              firstname: addrequestJSON.firstname,
              lastname: addrequestJSON.lastname,
              email:addrequestJSON.email,
              state :  addrequestJSON.state,
              affiliation : addrequestJSON.affiliation,
              role:addrequestJSON.role,
              status:addrequestJSON.status
            },
          })
        );
        body = {'statusCode' : statusCode ,  'message' :  'Your Account has been submitted to AFSCME for review.' , 'id' : addrequestJSON.id }; 
        break;
        
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
