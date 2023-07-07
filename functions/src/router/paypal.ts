import express from 'express';
import { handleIPN, handleCallback } from '../listeners/paypal/listener'
import { createSubscription, cancelSubscription, changePlan } from '../listeners/paypal/subscription';
import { isAuthenticated, isParametersValid } from '../middlewares/index';
 
export default (router: express.Router) => {
    router.post('/listener', handleIPN);
    router.get('/return', handleCallback);
    router.post('/subscription/create', isAuthenticated, isParametersValid, createSubscription);
    router.post('/subscription/cancel', isAuthenticated, cancelSubscription);
    router.post('/subscription/changPlan', isAuthenticated, changePlan);
};