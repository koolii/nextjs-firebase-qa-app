### 環境変数

`NEXT_PUBLIC_` というプレフィックスがついています。これは Next.js の仕様で、このプレフィックスがついている環境変数については自動的にブラウザ実行時にも利用できるようになっています。

便利な機能ですが、逆にサーバーサイドだけで利用すべき重要な認証情報などを同じやり方で環境変数に指定してしまうと情報漏えいになりますので気をつけましょう。

## SSR

### SSR 時の処理では query の値が存在しない

ref: `pages/users/[uid].tsx`

query に値がある場合だけ処理するように調整を実施することで
SSR 時の 1 回だけ呼ばれ、ブラウザ表示時は何もしないようにする

## Firebase

### 無限スクロール

ref: `pages/questions/received.tsx`

orderBy を使っている場合、クエリに startAfter を追加することで
現在取得済みの値以降のデータを取得することができます

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
