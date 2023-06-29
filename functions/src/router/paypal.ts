import express from 'express';
import { handleIPN, handleCallback } from '../listeners/paypal/listener'
import { createSubscription } from '../listeners/paypal/subscription';
import { isAuthenticated } from '../middlewares/index';
 
export default (router: express.Router) => {
    router.post('/listener', handleIPN);
    router.get('/return', handleCallback);
    router.post('/subscription/create', isAuthenticated, createSubscription);
};