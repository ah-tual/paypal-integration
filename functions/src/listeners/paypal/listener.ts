import express from 'express';
import querystring from 'querystring';
import  { AxiosResponse, AxiosError } from 'axios';
import { getFirestore } from "firebase-admin/firestore";

import config from '../../default';
import { postForm } from '../../helpers/apiClient';

export const handleCallback = async (req: express.Request, res: express.Response) => {
  console.log("Callback Notification Event Received");
  console.log(req.query);
  console.log(req.params);
  console.log(req.body);
}

export const handleIPN = async (req: express.Request, res: express.Response) => {
  console.log("IPN Notification Event Received");

  if (req.method !== "POST") {
    console.error("Request method not allowed.");
    res.status(405).send("Method Not Allowed");
  } else {
    console.log("IPN Notification Event received successfully.");
    const writeResult = await getFirestore()
      .collection('paypalIPNHistory')
      .add({ 'log': querystring.stringify(req.body) });
    console.log(`Log with ID: ${writeResult.id} added.`);
    res.status(200).send(`Log with ID: ${writeResult.id} added.`);
  }

  let ipnTransactionMessage = req.body;
  let formUrlEncodedBody = querystring.stringify(ipnTransactionMessage);
  let verificationBody = `cmd=_notify-validate&${formUrlEncodedBody}`;

  console.log(`Verifying IPN: ${verificationBody}`);

  postForm(`${config.paypal.ipnUrl}/cgi-bin/webscr`, { ...req.body, cmd: `_notify-validate` })
  .then((res: AxiosResponse) => {
    console.log('Response:', res.data);
    if (res.status == 200) {
      if (res.data === "VERIFIED") {
        console.log(
          `Verified IPN: IPN message for Transaction ID: ${ipnTransactionMessage.txn_id} is verified.`
        );
      } else if (res.data === "INVALID") {
        console.error(
          `Invalid IPN: IPN message for Transaction ID: ${ipnTransactionMessage.txn_id} is invalid.`
        );
      } else {
        console.error("Unexpected reponse body.");
      }
    }
  })
  .catch((error: AxiosError) => {
    console.error('Error:', error.message);
  });


  // axios.post(`${config.paypalIPNUri}/cgi-bin/webscr`, verificationBody, {
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   }
  // })
  // .then((res: AxiosResponse) => {
  //   console.log('Response:', res.data);
  //   if (res.status == 200) {
  //     if (res.data === "VERIFIED") {
  //       console.log(
  //         `Verified IPN: IPN message for Transaction ID: ${ipnTransactionMessage.txn_id} is verified.`
  //       );
  //     } else if (res.data === "INVALID") {
  //       console.error(
  //         `Invalid IPN: IPN message for Transaction ID: ${ipnTransactionMessage.txn_id} is invalid.`
  //       );
  //     } else {
  //       console.error("Unexpected reponse body.");
  //     }
  //   }
  // })
  // .catch((error: AxiosError) => {
  //   console.error('Error:', error.message);
  // });
};