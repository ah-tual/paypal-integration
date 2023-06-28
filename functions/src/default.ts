const env = 'dev';

export const devConfig = {
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
        basicAuth: 'Basic '
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
        basicAuth: 'Basic QVFlaWpMcXk4UWJVVjNBR2E1QlM4eHJIaXFXT3dYSW42VTdadUdEOUJDTURrdUlXNFhvMVZSTlpOa1BPMGY2NlZpR3FRYU90eENvR0VNQU46RUpIdWxFakxGWGdaQWlwc1B0RmpHN2ZFLUoydExLYzFaZ0Y5MnlsdjMzTTRCeTRTallBVTJLTHVqSFZtOTQzSHRReEd1WkJ1X3p4cnlUZ2Q='
    },
    google: {
        clientId: '351360855136-c65vr13tal2in9b9m1hdmp5dgr4rie3l.apps.googleusercontent.com'
    }
};

export default env == 'dev' ? devConfig : config;