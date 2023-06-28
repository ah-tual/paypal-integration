import { Request, Response } from 'express';
import * as usecase from '../../usecases/paypal/subscription'

export const createSubscription = async (req: Request, res: Response) => {
    try {
        console.log("*********************************");
        console.log(req.body.planId);
        const url = await usecase.createSubscription(req.body.planId, req.user!);
        console.log("*********************************");
        console.log(url);
        return res.sendStatus(200);
    }
    catch (ex) {
        console.log(ex);
        return res.sendStatus(400);
    }
}