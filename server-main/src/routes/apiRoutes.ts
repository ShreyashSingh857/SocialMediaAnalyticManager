import express from 'express';
import { getFeed } from '../controllers/feedController.js';
import { analyzeContent } from '../controllers/aiProxyController.js';

const router = express.Router();

router.get('/feed', getFeed);
router.post('/ai/analyze', analyzeContent);

export default router;
