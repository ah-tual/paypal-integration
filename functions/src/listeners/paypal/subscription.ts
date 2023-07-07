import { Request, Response } from 'express';
import * as usecase from '../../usecases/paypal/subscription'
import * as logger from '../../utils/logger'

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const url = await usecase.createSubscription(req.body.planId, req.body.returnUrl, req.user!);
        return res.status(200).send({ 
            result: '00', 
            redireUrl: url 
        });
    }
    catch (ex) {
        logger.error(`${ex}`);
        return res.sendStatus(400);
    }
}

export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        await usecase.cancelSubscription(req.body.planId, `cancel the current service for ${req.user!.email}`);
        return res.status(200).json({ result: '00' });
    }
    catch (ex) {
        logger.error(`${ex}`);
        return res.sendStatus(400);
    }
}

export const changePlan = async (req: Request, res: Response) => {
    try {
        const url = await usecase.changePlan(req.body.subscriptionId, req.body.planId, req.user!);
        return res.status(200).json({ 
            result: '00',
            redireUrl: url
        });
    }
    catch (ex) {
        logger.error(`${ex}`);
        return res.sendStatus(400);
    }
}