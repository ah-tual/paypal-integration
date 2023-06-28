import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';
import config from '../default'
//import * as logger from '../utils/logger'
import { User } from '../models/google/user';

const client = new OAuth2Client(config.google.clientId);

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.headers.authorization;
    //const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk5YmNiMDY5MzQwYTNmMTQ3NDYyNzk0ZGZlZmE3NWU3OTk2MTM2MzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzUxMzYwODU1MTM2LWM2NXZyMTN0YWwyaW45YjltMWhkbXA1ZGdyNHJpZTNsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzUxMzYwODU1MTM2LWM2NXZyMTN0YWwyaW45YjltMWhkbXA1ZGdyNHJpZTNsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3NzU0MTEzMTc3MTA1NTQ1NDAyIiwiZW1haWwiOiJ0dWFudmEuZGV2ZWxvcGVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiOENUTlgzcHBTNmNaeVB3dHd5eXJRdyIsIm5hbWUiOiJWdSBUdWFuIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGNfd2xBUmVObUNtUGZXUDdtbUdVYVNYUXVCeGd1NzRPYlg1cHc1bWtybz1zOTYtYyIsImdpdmVuX25hbWUiOiJWdSIsImZhbWlseV9uYW1lIjoiVHVhbiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjg3ODU0MzQwLCJleHAiOjE2ODc4NTc5NDAsImp0aSI6IjRjZGUyYjVlM2QxODk1YTA2NDU1ZDEzMjhkZjdkZDc1NjVlYmJkNGIifQ.mOOS-JmgqoTKLuLwopPIoa4Yx57KjSpeaKy1CpMOWT_P0mrqQ88OLRTzI_ifFKS-6YM-Ti6IKEZg5c3cwHWrND2wUi4r4yJiVz7ljMVBFPMS91RmrAcG3RcL_36PX0b5Uox2mCv8MRZQsbR_2SFuaD6p2QOxi3UhOd7Yj9krobflu8L1bbDu78iQ4Ej236kpGht8-F2iAvamh3DEof9HbaKAdstn9Pc28KRFwzu0PTIvAH9VS0KGo5sqcIiLdgD-mleLNVGKRldKZpn5UDi57eJAG5IDkxODGArtDIw7eRPUZbtpJ41NXITmBlbbnK_2NenMDn8oe3NQZDmIy08AHQ";
    const token = authorizationHeader?.split(' ')[1];

    if (!token) {
      return res.sendStatus(403);
    }

    const ticket = await client.verifyIdToken({
      idToken: token!,
      audience: config.google.clientId,
    });

    if (!ticket) {
      return res.sendStatus(403);
    }

    const payload = ticket.getPayload() as TokenPayload;

    if (!payload) {
      return res.sendStatus(403);
    }

    req.user = User.get(payload);
  }
  catch (error) {
    return res.sendStatus(400);
  }
  finally {
    return next();
  }
}