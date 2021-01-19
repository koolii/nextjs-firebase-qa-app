import { useEffect, useState } from 'react'
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
        </div>
      )}
    </Layout>
  )
}
