import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';
import config from '../default'
import * as logger from '../utils/logger'
import { User } from '../models/google/user';

const client = new OAuth2Client(config.google.clientId);

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.sendStatus(403);
    }

    const ticket = await client.verifyIdToken({
      idToken: token!,
      audience: config.google.clientId,
    });

    if (!ticket || !ticket.getPayload()) {
      return res.sendStatus(403);
    }

    req.user = User.get(ticket.getPayload() as TokenPayload);

    return next();
  }
  catch (error) {
    logger.error(`${error}`);
    return res.sendStatus(403);
  }
}

export function isParametersValid(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.planId) {
      const pattern = /^P-[A-Za-z0-9\-]+$/;
      if (!pattern.test(req.body.planId)) {
        return res.status(400).send({ 
          invalidField: 'planId' 
        });
      }
    }
    if (req.body.subscriptionId) {
      const pattern = /^I-[A-Za-z0-9\-]+$/;
      if (!pattern.test(req.body.subscriptionId)) {
        return res.status(400).send({ 
          invalidField: 'subscriptionId' 
        });
      }
    }
    if (req.body.returnUrl) {
      const pattern = /^(http|https):\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/;
      if (!pattern.test(req.body.returnUrl)) {
        return res.status(400).send({ 
          invalidField: 'returnUrl' 
        });
      }
    }
    return next();
  }
  catch (error) {
    return res.sendStatus(404);
  }
}