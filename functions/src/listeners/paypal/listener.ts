import express from 'express';
import querystring from 'querystring';
import { AxiosResponse, AxiosError } from 'axios';
import { getFirestore } from "firebase-admin/firestore";

import config from '../../default';
import { postForm } from '../../helpers/apiClient';
import { verifySubcription } from '../../usecases/paypal/subscription';
import * as logger from '../../utils/logger'

export const handleCallback = async (req: express.Request, res: express.Response) => {
  try {
    const subRes = await verifySubcription(<string>req.query.ba_token, <string>req.query.subscription_id);
    return res.redirect(`${subRes.returnUrl}?subscriptionId=${subRes.subscriptionId}&status=${subRes.status}`);
  }
  catch (ex) {
    return res.status(400);
  }
}

export const handleIPN = async (req: express.Request, res: express.Response) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
  } 
  
  logger.debug(`ipn->req->body: ${querystring.stringify(req.body)}`);

  await getFirestore()
      .collection('paypalIPNHistory')
      .add({ 'log': querystring.stringify(req.body) });

  postForm(`${config.paypal.ipnUrl}/cgi-bin/webscr`, { ...req.body, cmd: `_notify-validate` })
    .then((res: AxiosResponse) => {
      if (res.status == 200) {
        if (res.data == "VERIFIED") {
          if (req.body.profile_status == 'Active') {
            getFirestore()
              .collection('txns')
              .add({
                'txnId': req.body.txn_id,
                'subscriptionId': req.body.recurring_payment_id,
                'payerEmail': req.body.payer_email,
                'paymentDate': new Date(decodeURI(req.body.payment_date)).getTime(),
                'productName': req.body.product_name,
                'amount': req.body.amount,
                'fee': req.body.payment_fee,
                'currency': req.body.mc_currency,
                'status': req.body.payment_status,
                'retrievalCount': 0
              });
          }
          else if (req.body.profile_status == 'Cancelled') {
            getFirestore()
            .collection('subscriptions')
            .where('subscriptionId', '==', req.body.recurring_payment_id)
            .where('status', '==', 1)
            .limit(1)
            .get()
            .then((doc: any) => {
              doc.ref.update({
                  status: -1,
                  cancelAt: (new Date()).getTime()
              })
            })
          }
        }
      }
    })
    .catch((error: AxiosError) => {
      logger.error(`${error}`);
    });

    res.status(200);
};