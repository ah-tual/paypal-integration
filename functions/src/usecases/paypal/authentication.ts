import { v4 as uuidv4 } from 'uuid';
import config from '../../default'
import { postForm } from '../../helpers/apiClient';

export const getToken = async (): Promise<string> => {
    return (
        await postForm<any, any>(`${config.paypal.url}/v1/oauth2/token`, {
            grant_type: 'client_credentials'
        }, {
            'Authorization': config.paypal.basicAuth,
            'PayPal-Request-Id': uuidv4(),
            'Prefer': 'return=representation' 
        })
    ).data.accessToken;
}