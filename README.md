# ocwi2trello

## セットアップ

### インストール

anyenv (+ anyenv-update) + nodenvを利用している前提。他の方法でもNode.js 14.4.0で起動できればOK

```
$ cd ocwi2trello/
$ anyenv update nodenv
$ nodenv install 14.4.0
$ exec $SHELL -l
$ npm install
```

### 鍵の作成

暗号化に使うキーフレーズを生成します。

```
$ npm run generate_key
```

### 認証情報の登録

ドキュメントルート(` ocwi2trello/` )にマトリクスコードのJSONファイルを入れてください。

(TitechAppからエクスポートした形式。A1,A2,A3,...,J7の順。サンプルファイル参照)

初回起動時に学籍番号、パスワード、マトリクスコードのJSONファイル名を聞かれます。

実行後、認証情報は暗号化して保存されるので、マトリクスコードのJSONファイルは削除してかまいません。

```
$ npm run main
> ocwi2trello@1.0.0 main /Users/arthur/Documents/repositories/ocwi2trello
> node src/main.js

init!
Student ID?: 15B00265
Password?: **********
Matrix Code File Name? (matrix-code.json):
```

### 認証情報の削除

パスワードを間違えたetc、暗号化した情報をリセットしたい場合。

```
$ npm run delete_credentials
```

### trelloのAPIキー設定

`.env` に追記

```
TRELLO_KEY="trellos_secret_key"
TRELLO_TOKEN="trellos_secret_token"
TRELLO_USER_ID="my_user_id"
```

### 使用するボード・リストの選択

上の環境変数を正しくセットしてから実行してください。

```
$ npm run set_trello_board
```

## 実行

```
$ npm run main
```
