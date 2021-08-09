import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as logs from '@aws-cdk/aws-logs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

export class SlackChannelNotifierStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const channel = this.node.tryGetContext('channel') || 'general';
    const tagKey = this.node.tryGetContext('tagKey');
    const tagValue = this.node.tryGetContext('tagValue');

    const secret = new secretsmanager.Secret(this, 'SlackChannelNotifierSecret', {
      secretName: 'SLACK_CHANNEL_NOTIFIER_OAUTH_TOKEN',
    });
    const api = new apigateway.RestApi(this, 'SlackChannelNotifierApi', { cloudWatchRole: false });
    const handler = new nodejs.NodejsFunction(this, 'handler', {
      functionName: 'SlackChannelNotifierHandler',
      environment: {
        TARGET_CHANNEL: channel,
      },
    });
    api.root.addMethod('POST', new apigateway.LambdaIntegration(handler))
    secret.grantRead(handler);

    if (!!tagKey && !!tagValue) {
      cdk.Tags.of(secret).add(tagKey, tagValue);
      cdk.Tags.of(api).add(tagKey, tagValue);
      cdk.Tags.of(handler).add(tagKey, tagValue);
    }
  }
}
