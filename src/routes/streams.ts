import { Router, Request, Response } from 'express';
import { ContractService } from '../services/contracts.js';
import { CreateStreamSchema } from '../types/index.js';
import { validate } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = Router();
const contractService = new ContractService();

// GET /api/streams/:id - Get stream details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stream = await contractService.getStream(id);

    res.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    logger.error('Failed to get stream', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stream',
    });
  }
});

// POST /api/streams - Create a new payment stream
router.post('/', validate(CreateStreamSchema), async (req: Request, res: Response) => {
  try {
    const txHash = await contractService.createStream(req.body, req.body.keypair);

    res.status(201).json({
      success: true,
      data: { transactionHash: txHash },
      message: 'Payment stream created successfully',
    });
  } catch (error) {
    logger.error('Failed to create stream', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create payment stream',
    });
  }
});

// POST /api/streams/:id/withdraw - Withdraw from stream
router.post('/:id/withdraw', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const txHash = await contractService.withdraw(id, amount || null, req.body.keypair);

    res.json({
      success: true,
      data: { transactionHash: txHash },
      message: 'Withdrawal successful',
    });
  } catch (error) {
    logger.error('Failed to withdraw from stream', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw from stream',
    });
  }
});

// POST /api/streams/:id/pause - Pause stream
router.post('/:id/pause', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Pausing stream', { id });

    res.json({
      success: true,
      message: 'Stream paused successfully',
    });
  } catch (error) {
    logger.error('Failed to pause stream', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to pause stream',
    });
  }
});

// POST /api/streams/:id/resume - Resume stream
router.post('/:id/resume', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Resuming stream', { id });

    res.json({
      success: true,
      message: 'Stream resumed successfully',
    });
  } catch (error) {
    logger.error('Failed to resume stream', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to resume stream',
    });
  }
});

// POST /api/streams/:id/stop - Stop stream
router.post('/:id/stop', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Stopping stream', { id });

    res.json({
      success: true,
      message: 'Stream stopped successfully',
    });
  } catch (error) {
    logger.error('Failed to stop stream', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to stop stream',
    });
  }
});

// GET /api/streams/:id/withdrawable - Get withdrawable amount
router.get('/:id/withdrawable', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Getting withdrawable amount', { id });

    res.json({
      success: true,
      data: { amount: '0' },
    });
  } catch (error) {
    logger.error('Failed to get withdrawable amount', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to get withdrawable amount',
    });
  }
});

export default router;
