import firebase from 'firebase/app'

function authentication() {
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
    } else {
      console.log("onAuthStateChanged/no-user");
    }
  })
}

if (process.browser) authentication();
