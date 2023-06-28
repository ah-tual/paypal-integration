//import axios from 'axios';
//import { AxiosError, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import config from '../../default'
import { postForm } from '../../helpers/apiClient';

export const getToken = async (): Promise<string> => {
    // const data = (await axios.post(`${config.paypalUri}/v1/oauth2/token`, { grant_type: 'client_credentials' }, {
    //     headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': 'Basic QVFlaWpMcXk4UWJVVjNBR2E1QlM4eHJIaXFXT3dYSW42VTdadUdEOUJDTURrdUlXNFhvMVZSTlpOa1BPMGY2NlZpR3FRYU90eENvR0VNQU46RUpIdWxFakxGWGdaQWlwc1B0RmpHN2ZFLUoydExLYzFaZ0Y5MnlsdjMzTTRCeTRTallBVTJLTHVqSFZtOTQzSHRReEd1WkJ1X3p4cnlUZ2Q='
    //     }
    // })).data;

    // console.log('====================================');
    // console.log(data);

    // return data.access_token;


    return (
        await postForm<any, any>(`${config.paypal.url}/v1/oauth2/token`, {
            grant_type: 'client_credentials'
        }, {
            'Authorization': config.paypal.basicAuth,
            'PayPal-Request-Id': uuidv4(),
            'Prefer': 'return=representation' 
        })
    ).data.access_token;
}