import * as path from 'path'
import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, registerFont, loadImage, CanvasRenderingContext2D, Canvas } from 'canvas'
import '../../../../lib/firebase_admin'
import { firestore } from 'firebase-admin'
import { Answer } from '../../../../models/Answer'
import { Question } from '../../../../models/Question'

type SeparatedText = {
  line: string
  remaining: string
}

function createTextLine(ctx: CanvasRenderingContext2D, text: string): SeparatedText {
  const maxWidth = 400

  for (let i = 0; i < text.length; i++) {
    // canvasは自動的に文章を折り返さない
    // measureText メソッドを使って文章の横幅を計算しつつ、適宜行ごとに分割して描画
    const line = text.substring(0, i + 1)
    if (ctx.measureText(line).width > maxWidth) {
      return {
        line,
        remaining: text.substring(i + 1),
      }
    }
  }

  return {
    line: text,
    remaining: '',
  }
}

function createTextLines(ctx: CanvasRenderingContext2D, text: string): string[] {
  const lines: string[] = []
  let currentText = text

  while(currentText !== '') {
    const separatedText = createTextLine(ctx, currentText)
    lines.push(separatedText.line)
    currentText = separatedText.remaining
  }

  return lines
}

// (回答内容を載せた) ogp画像を node-canvas を使って作成する
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string
  const answerDoc = await firestore().collection('answers').doc(id).get()
  const answer = answerDoc.data() as Answer;
  const questionDoc = await firestore().collection('questions').doc(answer.questionId).get()
  const question = questionDoc.data() as Question;

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

  // background images
  const backgroundImage = await loadImage(path.resolve('./images/ogp_background.jpg'))
  ctx.drawImage(backgroundImage, 0, 0, width, height)

  // dummy
  ctx.font = '20px ipaexg'
  ctx.fillStyle = '#424242'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // ctx.fillText('testテスト', 100, 50)

  const lines = createTextLines(ctx, question.body)
  lines.forEach((line, index) => {
    const y = 157 + 40 * (index - (lines.length - 1) / 2)
    ctx.fillText(line, 300, y)
  })

  // canvasの内容をバイナリに起こす
  const buffer = canvas.toBuffer()

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': buffer.length
  })

  res.end(buffer, 'binary')
}
