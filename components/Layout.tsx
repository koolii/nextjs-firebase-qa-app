import React from 'react'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'

export default function Layout({ children }) {
  const title = 'My質問回答サービス'
  const description = '質問と回答を行えるサービスです。'

  // 通常の meta タグとは違い、key を指定しています
  // このようにしてユニークな key を指定しておくことで、別のページから同じ key を指定して上書きができます。
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" key="description" content={description} />
        <meta property="og:title" key="ogTItle" content={title} />
        <meta property="og:site_name" key="ogSiteName" content={title} />
        <meta
          property="og:description"
          key="ogDescription"
          content={description}
        />
      </Head>
      <nav
        className="navbar navbar-expand-lg navbar-light mb-3"
        style={{ backgroundColor: '#e3f2fd' }}
      >
        <div className="container">
          <div className="mr-auto">
            <a className="navbar-brand" href="#">
              Navbar
            </a>
          </div>
          <form className="d-flex">
            <button className="btn btn-outline-primary" type="submit">
              Search
            </button>
          </form>
        </div>
      </nav>
      <div className="container">{children}</div>
      <ToastContainer />
    </div>
  )
}
