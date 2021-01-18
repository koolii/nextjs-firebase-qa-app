import firebase from 'firebase/app'
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil'
import { User } from "../models/User"

// atom()でstateを生成
const userState = atom<User>({
  key: 'user',
  default: null,
})

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
        setUser({
          uid: user.uid,
          isAnonymous: user.isAnonymous,
        })
      } else {
        console.log("onAuthStateChanged/no-user");
        setUser(null);
      }
    })
  }, []);

  return { user }
}
