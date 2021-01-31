import React from 'react'
import Head from 'next/head'
import Layout from '../../../components/Layout'
import { Answer } from '../../../models/Answer'
import { Question } from '../../../models/Question'
import TwitterShareButton from '../../../components/TwitterShareButton'

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

// このページをシェアした場合にogp画像が出力されるようにする
// meta タグに ogp用のURL を指定します。これによりSNSでシェアした際にそのURLが参照されて表示されます。
// ogp用のURL は http から始まるフルの URL である必要があります
//
// Twitter Card Validator というページがあります。そこに URL を入力することで確認も可能です。
// https://cards-dev.twitter.com/validator
// ※ Twitter で一度表示した OGP 用画像は Twitter 側でキャッシュされてしまい
//   プログラムを更新してもしばらくは画像の変更が反映されません
//   上記のValidatorを利用することでキャッシュをすぐに削除してくれる効果もあります
export default function AnswersShow(props: Props) {
  const description = getDescription(props.answer)
  const ogpImageUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/api/answers/${props.answer.id}/ogp`

  return (
    <Layout>
      <Head>
        <meta property="og:image" key="ogImage" content={ogpImageUrl} />
        <meta name="twitter:card" key="twitterCard" content="summary_large_image" />
        <meta name="twitter:image" key="twitterImage" content={ogpImageUrl} />
        <meta name="description" key="description" content={description} />
        <meta
          property="og:description"
          key="ogDescription"
          content={description}
        />
      </Head>
      <div className="my-3 d-flex justify-content-center">
        <TwitterShareButton
          url={`${process.env.NEXT_PUBLIC_WEB_URL}/answers/${props.answer.id}`}
          text={props.answer.body}
        ></TwitterShareButton>
      </div>
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
