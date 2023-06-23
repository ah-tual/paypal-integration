import express from 'express';

import paypal from './paypal';

const router = express.Router();

export default (): express.Router => {
  paypal(router);

  return router;
};
