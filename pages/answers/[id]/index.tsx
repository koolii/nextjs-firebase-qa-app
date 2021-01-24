import React from 'react'
import Head from 'next/head'
import Layout from '../../../components/Layout'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'

// getServerSideProps という関数を作成します。
// これは必ずサーバーサイドで呼ばれる処理です。
// SSR の場合はそのままサーバーサイドで処理されますし、
// ページ移動してきた場合はまずサーバーサイドで実行されたこの処理をクライアント側で取得してから処理が行われます。
export async function getServerSideProps({ query }) {
  const res = await fetch(process.env.API_URL + `/api/answers/${query.id}`)
  const json = await res.json()
  return { props: json }
}

function getDescription(answer: Answer) {
  const body = answer.body.trim().replace(/[ \r\n]/g, '')
  if (body.length < 140) {
    return body
  }
  return body.substring(0, 140) + '...'
}

type Props = {
  answer: Answer
  question: Question
}

export default function AnswersShow(props: Props) {
  const description = getDescription(props.answer)

  return (
    <Layout>
      <Head>
        <meta name="description" key="description" content={description} />
        <meta
          property="og:description"
          key="ogDescription"
          content={description}
        />
      </Head>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <>
          <div className="card">
              <div className="card-body">{props.question.body}</div>
            </div>

            <section className="text-center mt-4">
              <h2 className="h4">回答</h2>

              <div className="card">
                <div className="card-body text-left">{props.answer.body}</div>
              </div>
            </section>
          </>
        </div>
      </div>
    </Layout>
  )
}
