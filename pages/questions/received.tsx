import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import firebase from 'firebase/app'
import dayjs from 'dayjs'
import { useAuthentication } from '../../hooks/authentication';
import { Question } from '../../models/Question';
import Layout from '../../components/Layout';

export default function Page() {
  const { user } = useAuthentication()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isPaginationFinished, setIsPaginationFinished] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  function createBaseQuery() {
    return firebase
      .firestore()
      .collection('questions')
      .where('receiverUid', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
  }

  function appendQuestions(snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) {
    const gotQuestions = snapshot.docs.map((doc) => {
      const question = doc.data() as Question
      question.id = doc.id
      return question
    })
    setQuestions(questions.concat(gotQuestions))
  }

  async function loadQuestions() {
    const snapshot = await createBaseQuery().get()
    if (snapshot.empty) {
      setIsPaginationFinished(true)
      return
    }
    appendQuestions(snapshot)
  }

  // for infinite scroll
  async function loadNextQuestions() {
    if (questions.length === 0) return
    // orderBy を使っている場合
    // クエリに startAfter を追加することで
    // 現在取得済みの値以降のデータを取得することができます
    // ※ (実際の実装) startAfter()/createBaseQuery()を使うことで
    // 取得条件は同一でありながら、start地点をリストの一番最後から取得する
    const lastQuestion = questions[questions.length - 1]
    const snapshot = await createBaseQuery()
      .startAfter(lastQuestion.createdAt)
      .get()

    if (snapshot.empty) return
    appendQuestions(snapshot)
  }

  useEffect(() => {
    if (!process.browser) return
    if (!user) return
    loadQuestions()
  }, [process.browser, user])

  // handler scrolling
  function onScroll() {
    if (isPaginationFinished) return

    const container = scrollContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // containerの高さと画面サイズを比較、はみ出している場合は追加データを読み込む
    // rect.top => container(div)までの高さ
    // rect.height => containerの高さ
    if (rect.top + rect.height > window.innerHeight) return

    loadNextQuestions()
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [questions, scrollContainerRef.current, isPaginationFinished])

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6" ref={scrollContainerRef}>
          {questions.map((question) => (
            <Link href={`/questions/${question.id}`} key={question.id}>
              <a>
                <div className="card my-3">
                  <div className="card-body">
                    <div className="text-truncate">{question.body}</div>
                    <div className="text-muted text-end">
                      <small>{dayjs(question.createdAt.toDate()).format('YYYY/MM/DD HH:mm')}</small>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
