import React, { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import firebase from 'firebase/app'
import Layout from '../../components/Layout'
import { Question } from '../../models/Question'
import { useAuthentication } from '../../hooks/authentication';

type Query = {
  id: string;
}

export default function QuestionShow() {
  const router = useRouter()
  const query = router.query as Query
  const { user } = useAuthentication()
  const [question, setQuestion] = useState<Question>()
  const [isSending, setIsSending] = useState(false)
  const [body, setBody] = useState('')

  async function loadData(id: string) {
    if (!id) return

    const questionDoc = await firebase
      .firestore()
      .collection('questions')
      .doc(id)
      .get()

    if (!questionDoc.exists) return

    const gotQuestion = questionDoc.data() as Question
    gotQuestion.id = questionDoc.id
    setQuestion(gotQuestion)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSending(true)

    // `runTransaction()` を使うこと
    // 複数のデータのCRUD操作もトランザクション管理ができるようになる
    await firebase.firestore().runTransaction(async (t) => {
      t.set(firebase.firestore().collection('answers').doc(), {
        uid: user.uid,
        questionId: question.id,
        body,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }),
      t.update(firebase.firestore().collection('questions').doc(question.id), {
        isReplied: true,
      })
    })

    setIsSending(false)
  }

  useEffect(() => {
    loadData(query.id)
  }, [query.id])

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {question && (
            <div className="card">
              <div className="card-body">{question.body}</div>
            </div>
          )}
        </div>
      </div>
      <section>
        <h2 className="h4">回答する</h2>
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
              <div className="spinner-border text-secondary" role="status"></div>
            ) : (
              <button type="submit" className="btn btn-primary">
                回答する
              </button>
            )}
          </div>
        </form>
      </section>
    </Layout>
  )
}
