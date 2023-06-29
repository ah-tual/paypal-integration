import { v4 as uuidv4 } from 'uuid';
import config from '../../default'
import { get } from '../../helpers/apiClient';
import { IPlan } from '../../models/paypal/plan';
import { getToken } from './authentication';

export const getPlanById = async (planId: string, token?: string): Promise<IPlan> => {
    if (!token) {
        token = await getToken();
    }
    return (
        await get<IPlan>(`${config.paypal.url}/v1/billing/plans/${planId}`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data;
}