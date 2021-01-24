import { NextApiRequest, NextApiResponse } from 'next'
import '../../../../lib/firebase_admin'
import { firestore } from 'firebase-admin'
import { Answer } from '../../../../models/Answer';
import { Question } from '../../../../models/Question';

type Data = {
  answer: Answer
  question: Question
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string
  console.log("API id: ", id);

  try {
    const doc = await firestore().collection('answers').doc(id).get()
    const answer = doc.data() as Answer
    answer.id = id

    if (!doc.exists) {
      throw new Error('answer not founc')
    }

    const qDoc = await firestore().collection('questions').doc(answer.questionId).get()
    const question = qDoc.data() as Question
    question.id = answer.id

    if (!qDoc.exists) {
      throw new Error('question not founc')
    }

    res.status(200).json({
      answer,
      question,
    })
  } catch (err) {
    res.status(404).json({ message: err?.message || "Occured Error" })
    return
  }
}
