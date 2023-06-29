import { Request, Response } from 'express';
import * as usecase from '../../usecases/paypal/subscription'

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const url = await usecase.createSubscription(req.body.planId, req.user!);
        res.status(200).json({ redireUrl: url });
    }
    catch (ex) {
        console.log(ex);
        res.sendStatus(400);
    }
}