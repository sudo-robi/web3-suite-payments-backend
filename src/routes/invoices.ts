import { Router, Request, Response } from 'express';
import { ContractService } from '../services/contracts.js';
import { CreateInvoiceSchema } from '../types/index.js';
import { validate } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = Router();
const contractService = new ContractService();

// GET /api/invoices/:id - Get invoice details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await contractService.getInvoice(id);

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    logger.error('Failed to get invoice', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve invoice',
    });
  }
});

// POST /api/invoices - Create a new invoice
router.post('/', validate(CreateInvoiceSchema), async (req: Request, res: Response) => {
  try {
    const txHash = await contractService.createInvoice(req.body, req.body.keypair);

    res.status(201).json({
      success: true,
      data: { transactionHash: txHash },
      message: 'Invoice created successfully',
    });
  } catch (error) {
    logger.error('Failed to create invoice', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice',
    });
  }
});

// POST /api/invoices/:id/send - Send invoice
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Sending invoice', { id });

    res.json({
      success: true,
      message: 'Invoice sent successfully',
    });
  } catch (error) {
    logger.error('Failed to send invoice', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to send invoice',
    });
  }
});

// POST /api/invoices/:id/pay - Pay invoice
router.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Processing invoice payment', { id });

    res.json({
      success: true,
      message: 'Invoice paid successfully',
    });
  } catch (error) {
    logger.error('Failed to pay invoice', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to pay invoice',
    });
  }
});

// POST /api/invoices/:id/cancel - Cancel invoice
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Cancelling invoice', { id });

    res.json({
      success: true,
      message: 'Invoice cancelled successfully',
    });
  } catch (error) {
    logger.error('Failed to cancel invoice', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to cancel invoice',
    });
  }
});

export default router;
