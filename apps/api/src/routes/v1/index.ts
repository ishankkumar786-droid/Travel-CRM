import { Router } from 'express';

import agenciesRouter from './agencies';
import authRouter from './auth';
import crmRouter from './crm';
import healthRouter from './health';
import marketplaceRouter from './marketplace';
import phase6Router from './phase6';
import publicRouter from './public';
import reviewsRouter from './reviews';
import notificationsRouter from './notifications';
import uploadRouter from './upload';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/public', publicRouter); // ← public BEFORE authenticated routers
router.use('/agencies', agenciesRouter);
router.use('/', crmRouter);
router.use('/', phase6Router);
router.use('/', marketplaceRouter);
router.use('/upload', uploadRouter);
router.use('/reviews', reviewsRouter);
router.use('/notifications', notificationsRouter);

export default router;
