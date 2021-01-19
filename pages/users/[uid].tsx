import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import firebase from 'firebase/app'
import { User } from '../../models/User';
import Layout from '../../components/Layout';

type Query = {
  uid: string;
}

// 問題
// loadUser()関数は動くのに "ロード中" とずっと表示されてしまう or RuntimeErrorが発生する
// これは「SSR時の処理ではqueryの値が存在しない」ため

export default function UserShow() {
  const router = useRouter()
  // User | nullはあまり意味がないらしい
  // useState(User)(); でundefinedで初期化も可能
  const [user, setUser] = useState<User>(null)
  const query = router.query as Query
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSending(true);

    // add()でfirestoreにデータを登録することでIDを自動生成してくれる
    await firebase.firestore().collection('questions').add({
      senderUid: firebase.auth().currentUser.uid,
      receiverUid: user.uid,
      body,
      isReplied: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })

    setBody('')
    setIsSending(false)
    alert('Sent a question :)')
  }

  useEffect(() => {
    // SSR を考慮するために query に値がある場合だけ処理するように調整します
    // => SSR 時の１回だけ呼ばれ、ブラウザ表示時に何もしてくれないためユーザーの読み込みが行われません
    if (query.uid === undefined) return;

    async function loadUser() {
      const doc = await firebase
        .firestore()
        .collection('users')
        .doc(query.uid)
        .get()

      if (!doc.exists) return

      // これは asを使わなくても良いやり方がある
      const gotUser = doc.data() as User
      gotUser.uid = doc.id
      setUser(gotUser)
    }
    loadUser()
    // query.uid が変わった場合に再度処理をするよう、useEffect の第２引数も変えておきます。
  }, [query.uid])

  return (
    <Layout>
      {user && (
        <div className="text-center">
          <h1 className="h4">{user.name}さんのページ</h1>
          <div className="m-5">{user.name}さんに質問しよう！</div>
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-6">
              <form onSubmit={onSubmit}>
                <textarea
                  className="form-control"
                  placeholder="おげんきですか？"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
                <div className="m-3">
                  {isSending ? (
                    <div className="spinner-border text-secondary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      質問を送信する
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
