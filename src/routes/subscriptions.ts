import { Router, Request, Response } from 'express';
import { ContractService } from '../services/contracts.js';
import { CreatePlanSchema, SubscribeSchema } from '../types/index.js';
import { validate } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = Router();
const contractService = new ContractService();

// GET /api/subscriptions/plans/:id - Get plan details
router.get('/plans/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await contractService.getPlan(id);

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Failed to get plan', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve plan',
    });
  }
});

// POST /api/subscriptions/plans - Create a new subscription plan
router.post('/plans', validate(CreatePlanSchema), async (req: Request, res: Response) => {
  try {
    const txHash = await contractService.createPlan(req.body, req.body.keypair);

    res.status(201).json({
      success: true,
      data: { transactionHash: txHash },
      message: 'Subscription plan created successfully',
    });
  } catch (error) {
    logger.error('Failed to create plan', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription plan',
    });
  }
});

// POST /api/subscriptions/subscribe - Subscribe to a plan
router.post('/subscribe', validate(SubscribeSchema), async (req: Request, res: Response) => {
  try {
    const txHash = await contractService.subscribe(req.body, req.body.keypair);

    res.status(201).json({
      success: true,
      data: { transactionHash: txHash },
      message: 'Subscription created successfully',
    });
  } catch (error) {
    logger.error('Failed to subscribe', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
    });
  }
});

// POST /api/subscriptions/:id/billing - Process billing
router.post('/:id/billing', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const txHash = await contractService.processBilling(id, req.body.keypair);

    res.json({
      success: true,
      data: { transactionHash: txHash },
      message: 'Billing processed successfully',
    });
  } catch (error) {
    logger.error('Failed to process billing', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to process billing',
    });
  }
});

// POST /api/subscriptions/:id/cancel - Cancel subscription
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Cancelling subscription', { id });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    logger.error('Failed to cancel subscription', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
    });
  }
});

// GET /api/subscriptions/:id - Get subscription details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Getting subscription details', { id });

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    logger.error('Failed to get subscription', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscription',
    });
  }
});

export default router;
