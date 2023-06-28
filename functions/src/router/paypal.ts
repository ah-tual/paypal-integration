import express from 'express';
import { handleIPN } from '../listeners/paypal/listener'
import { createSubscription } from '../listeners/paypal/subscription';

export default (router: express.Router) => {
    router.post('/listener', handleIPN);
    router.post('/subscription/create', createSubscription);
};