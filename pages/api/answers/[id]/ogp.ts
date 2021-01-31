import * as path from 'path'
import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, registerFont } from 'canvas'

// (回答内容を載せた) ogp画像を node-canvas を使って作成する
export default async (req: NextApiRequest, res: NextApiResponse) => {
  registerFont(path.resolve('./fonts/ipaexg.ttf'), {
    family: 'ipaexg',
  });

  // Twitter の OGP 用画像は比率が固定
  // 横600px、縦315px かその比率で作成すると丁度全て表示される
  const width = 600
  const height = 315
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // rendering
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, width, height)

  // dummy
  ctx.font = '20px ipaexg'
  ctx.fillStyle = '#424242'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('testテスト', 100, 50)

  // canvasの内容をバイナリに起こす
  const buffer = canvas.toBuffer()

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': buffer.length
  })

  res.end(buffer, 'binary')
}
