const env = 'dev';

export const devConfig = {
    app: {
        id: '',
        brand: 'perform-flow',
        domain: 'http://127.0.0.1:5001',
        returnUrl: 'http://127.0.0.1:5001/base-perform/us-central1/paypal/return',
        cancelUrl: 'http://127.0.0.1:5001/base-perform/us-central1/paypal/return',
    },
    paypal: {
        url: 'https://api-m.sandbox.paypal.com',
        ipnUrl: 'https://ipnpb.sandbox.paypal.com',
        basicAuth: 'Basic ='
    },
    google: {
        clientId: '351360855136-c65vr13tal2in9b9m1hdmp5dgr4rie3l.apps.googleusercontent.com'
    }
};

export const config = {
    app: {
        id: '',
        brand: 'perform-flow',
        domain: 'http://127.0.0.1:5001',
        returnUrl: '',
        cancelUrl: '',
    },
    paypal: {
        url: 'https://api-m.sandbox.paypal.com',
        ipnUrl: 'https://ipnpb.sandbox.paypal.com',
        basicAuth: 'Basic ='
    },
    google: {
        clientId: '351360855136-c65vr13tal2in9b9m1hdmp5dgr4rie3l.apps.googleusercontent.com'
    }
};

export default env == 'dev' ? devConfig : config;