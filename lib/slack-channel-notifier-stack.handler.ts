import { APIGatewayProxyEvent, APIGatewayEventRequestContext, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import axios from 'axios';

export async function handler(
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'bad request',
    };
  };

  // for event subscriptions
  const body = JSON.parse(event.body);
  if (!!body.challenge) {
    return {
      statusCode: 200,
      body: body.challenge,
    }
  }

  // notifications
  if (body.event.type === 'channel_created') {
    const message = 'new channel <#' + body.event.channel.id + '> is created by <@' + body.event.channel.creator + '>.';
    await postMessage(message);
  }
  if (body.event.type === 'channel_archive') {
    const message = '<#' + body.event.channel + '> is archived by <@' + body.event.user + '>.';
    await postMessage(message);
  }

  return {
    statusCode: 200,
    body: 'accepted',
  }
}

async function postMessage(text: string) {
  let token = await getSlackOAuthToken();
  const config = {
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + token,
    }
  };
  const body = {
    'channel': '#' + process.env.TARGET_CHANNEL,
    'text': text,
    'link_names': 1,
  };
  let response = await axios.post('https://slack.com/api/chat.postMessage', body, config);
  console.log(JSON.stringify(response.data));
};

async function getSlackOAuthToken() {
  const client = new AWS.SecretsManager({
    region: 'ap-northeast-1',
  });
  let secretValue = await client.getSecretValue({ SecretId: 'SLACK_CHANNEL_NOTIFIER_OAUTH_TOKEN' }).promise();
  return secretValue.SecretString;
}
