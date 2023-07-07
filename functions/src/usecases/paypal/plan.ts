import { v4 as uuidv4 } from 'uuid';
import config from '../../default'
import { get, postJson } from '../../helpers/apiClient';
import { IPlan } from '../../models/paypal/plan';
import { getToken } from './authentication';
import { IRequest, get as getCreatePlanRequest } from '../../requests/plan.create';
import { Response as ICreatePlanResponse } from '../../responses/plan.create';
import { Response as IGetPlanResponse } from '../../responses/plan.get';
import { ResourceNotFoundError } from '../../errors/resource';

export const getPlanById = async (planId: string, token?: string): Promise<IGetPlanResponse> => {
    if (!token) {
        token = await getToken();
    }
    return (
        await get<IGetPlanResponse>(`${config.paypal.url}/v1/billing/plans/${planId}`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data;
}

export const createSubPlan = async (planId: string, setupFee: number, token?: string): Promise<ICreatePlanResponse> => {
    if (!token) {
        token = await getToken();
    }

    const plan = (await getPlanById(planId)) as IPlan;

    if (!plan || !plan.billingCycles.find(x => x.tenureType == 'REGULAR')) {
        throw new ResourceNotFoundError(`Plan ${planId} not found`);
    }

    const createPlanRequest = getCreatePlanRequest(plan.productId, plan.name, `${plan.description}`, plan.billingCycles, setupFee);

    return (await postJson<IRequest, ICreatePlanResponse>(`${config.paypal.url}/v1/billing/plans`, createPlanRequest, {
        'Authorization': `Bearer ${token}`,
        'PayPal-Request-Id': uuidv4(),
        'Prefer': 'return=representation'
    })).data;
}