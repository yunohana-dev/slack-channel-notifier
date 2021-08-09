Slack Channel Notifier
===
チャネルの作成やアーカイブを任意のチャネルへ通知する lambda API をデプロイする

Setup
---
### lambda functionのデプロイ
```Shell
cdk deploy -c channel=general
```

### slack appの作成
1. Slack APIの[App ページ][apps]上の `Create New App` からアプリの作成をする
2. `Event Subscriptions` から lambda API との連携を追加する
    - `RequestURL` にデプロイした lambda API のURLを入力  
    `https://$lambda_id$.execute-api.ap-northeast-1.amazonaws.com/prod`
    - `Subscribe to Bot Events` に `channel_created`, `channel_archive` を指定
3. `OAuth & Permissions` から `Bot Token Scopes` に以下を指定する
    - `channels:read`
    - `chat:write`
    - `chat:write.customize`
4. `Install App` からワークスペースへアプリを追加する
5. ワークスペースへアプリを追加した後に表示される `Bot User OAuth Token` を  
AWS Secrets Managerの `SLACK_CHANNEL_NOTIFIER_OAUTH_TOKEN` の値に設定する
6. 通知先の slack チャネルへアプリを追加する

[apps]: https://api.slack.com/apps/

Context
---
`cdk deploy` で指定可能な `context` は以下の通り

| `key` | `default value` | desc
| :---: | :---: | ---
| `channel` | `general` | 通知先チャネル
| `tagKey` | `-` | AWSにデプロイする各種リソースにタグをつけたい場合その key
| `tagValue` | `-` | AWSにデプロイする各種リソースにタグをつけたい場合その value
