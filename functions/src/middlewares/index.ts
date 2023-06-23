//import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';
//import config from '../default'
//import * as logger from '../utils/logger'

//const client = new OAuth2Client(config.oauthClientId);

export async function isAuthenticated (req: Request, res: Response, next: NextFunction) {
  console.log('Incoming request:', req.method, req.url);
  try {
    // const authorizationHeader = req.headers.authorization;
    // const token = authorizationHeader?.split(' ')[1];
    // console.log(token);
    // logger.debug(token!, {});

    // if (!token) {
    //     return res.sendStatus(403);
    //   }

    // const ticket = await client.verifyIdToken({
    //     idToken: token!,
    //     audience: config.oauthClientId,
    // });

    // if (!ticket) {
    //     return res.sendStatus(403);
    //   }

    // const payload = ticket.getPayload() as TokenPayload;

    // if (!payload) {
    //     return res.sendStatus(403);
    //   }

    //   console.log(payload);
    //   logger.debug(JSON.stringify(payload), {});

    
  } 
  catch (error) {
        console.log(error);
        //return res.sendStatus(400);
  }
  finally {
    return next();
  }
}