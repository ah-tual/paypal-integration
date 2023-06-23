import { onRequest } from "firebase-functions/v2/https";
import * as firestore from "firebase-functions/v1/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express, { Request, Response } from 'express';
import cors from 'cors';

//import * as middleware from './middlewares/index';
import router from './router';

initializeApp();

const app = express();
const app2 = express();

app.use(cors({
  credentials: true,
}));

//app.use(middleware.isAuthenticated);
app.use('/', router());
app.get('/hello', (req: Request, res: Response) => {
  res.send('Hello, world!');
});
app2.get('/hello2', (req: Request, res: Response) => {
  res.send('Hello, world 2!');
});

export const paypal = onRequest(app);


export const addMessage = onRequest(async (req, res) => {
  const original = req.query.text;

  const writeResult = await getFirestore()
    .collection('messages')
    .add({ original });

  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

export const makeUppercase = firestore.document('/messages/{documentId}').onCreate(async (snapshot, context) => {
  const original = snapshot.data()?.original;
  const documentId = context.params.documentId;

  console.log('Uppercasing', documentId, original);

  const uppercase = original.toUpperCase();

  return snapshot.ref.set({ uppercase }, { merge: true });
});