### 環境変数

`NEXT_PUBLIC_` というプレフィックスがついています。これは Next.js の仕様で、このプレフィックスがついている環境変数については自動的にブラウザ実行時にも利用できるようになっています。

便利な機能ですが、逆にサーバーサイドだけで利用すべき重要な認証情報などを同じやり方で環境変数に指定してしまうと情報漏えいになりますので気をつけましょう。

### `import Link from next/link`

Link タグは内側に a タグで囲ってあげる => WHY?
※ おそらく Link タグだけだと Next.js 側だけで解釈されて、画面としてはリンクとして表現されていないのでは？
=> 検証してみるとやはりそうだった

Next.js < 9 では `as` の指定も必須となる

```typescript
// eg.
<Link href="/dummy">
  <a>
  { ... }
  </a>
</Link>
```

## SSR

### SSR 時の処理では query の値が存在しない

ref: `pages/users/[uid].tsx`

query に値がある場合だけ処理するように調整を実施することで
SSR 時の 1 回だけ呼ばれ、ブラウザ表示時は何もしないようにする

### getServerSideProps

ref: `pages/answers/[id]/index.tsx`

これは必ずサーバーサイドで呼ばれる処理です。
SSR の場合はそのままサーバーサイドで処理されますし、
ページ移動してきた場合はまずサーバーサイドで実行されたこの処理をクライアント側で取得してから処理が行われます。

## Firebase

### 無限スクロール

ref: `pages/questions/received.tsx`

orderBy を使っている場合、クエリに startAfter を追加することで
現在取得済みの値以降のデータを取得することができます

### firestore でトランザクション

ref: `pages/questions/[id].tsx`

`runTransaction()` を使うこと
複数のデータの CRUD 操作もトランザクション管理ができるようになる

```typescript
// t変数を利用することでトランザクション管理が可能
await firebase.firestore().runTransaction(async (t) => {});
```

## React

### useEffect の細かい挙動の説明

ref: `pages/questions/received.tsx`

最初にイベントリスナの設定を行うためいつもどおり useEffect を利用します。ただ、それだけですとページを移動した際にイベントが残ったままになってしまいますので、DOM が破棄されたときのために removeEventLister も実行する必要があります。useEffect に return することで破棄の処理を指定することができます。

このあたりは状況によってうまく動かない場合がありますので、第２引数の中身は適宜確認しながら調整していきます。というのも、useEffect の中は実行時の状態が保持されてしまいます。どれだけ setQuestions しようとも何も変わりません。表示は再生成されるため変わりますが、毎回必ず最初の配列に追加しただけの形になってしまいます。あくまでも全てのステートは、再生成されるから書き換わる、とおぼえておいてください。set したからといって瞬時に変数の中身が置き換わるわけではありません。useEffect の中は再実行されない限りこれが続きます。

### DOM.getBoundingClientRect()について

ref: `pages/questions/received.tsx`

```typescript
// containerはuseRefでDOM(div)を取得
const rect = container.getBoundingClientRect();
// containerの高さと画面サイズを比較、はみ出している場合は追加データを読み込む
// rect.top => container(div)までの高さ
// rect.height => containerの高さ
const isHigherThanWindow = divrect.top + rect.height > window.innerHeight;
```

## OGP 画像

### SNS 連携

ここはデータを useEffect を利用したクライアント側で取得する形ではなく、サーバーサイドで取得する形とします。なぜかと言うと、SNS で回答ページをシェアしてもらうときのために、meta タグをサーバー側で生成したいためです。

回答表示機能的にはクライアント側で行う形で問題ありません。しかし、そのページを SNS にシェアすると、各種 SNS のクローラは該当ページのサーバーサイドで生成された HTML の meta タグを取得していきます。そのあとブラウザの処理側で meta タグを更新してもクローラ的には意味がありません。

そのためシェアした内容を正確に SNS で表示したい場合には、サーバーサイドで meta タグを生成するように作成する必要があります。

### ヘッダ

ref: `/components/Layout.tsx`

通常の meta タグとは違い、key を指定しています。このようにしてユニークな key を指定しておくことで、別のページから同じ key を指定して上書きができます。
