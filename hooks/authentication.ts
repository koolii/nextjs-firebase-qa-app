import firebase from 'firebase/app'
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil'
import { User } from "../models/User"

// atom()でstateを生成
const userState = atom<User>({
  key: 'user',
  default: null,
})

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection('users').doc(user.uid)
  const doc = await userRef.get()
  if (doc.exists) {
    // 書き込みのほうが早い
    return
  }

  // userRefを user.uidベースで取得しているため、
  // 新規でユーザを作成した際にusersテーブルのidは `user.uid` となる
  await userRef.set({
    name: 'taro' + new Date().getTime(),
  })
}

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);

  // 何度も呼ばれてしまうため、useEffect()を使って一度だけにする
  useEffect(() => {
    console.log('Start useEffect')

    if (user !== null) {
      return
    }

    firebase
      .auth()
      .signInAnonymously()
      .catch(error => {
        if (error instanceof Error) {
          const code = (error as any).code;
          const { message } = error;
          console.log("SignInError: ", code, message);
        }
      });

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("onAuthStateChanged/user: ", user.uid, user.isAnonymous, user);
        const loginUser: User = {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          name: '',
        }
        setUser(loginUser)
        createUserIfNotFound(loginUser)
      } else {
        console.log("onAuthStateChanged/no-user");
        setUser(null);
      }
    })
  }, []);

  return { user }
}
