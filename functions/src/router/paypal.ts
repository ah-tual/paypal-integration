import express from 'express';
import { handleIPN } from '../listeners/paypal/listener'

export default (router: express.Router) => {
    router.post('/listener', handleIPN);
};