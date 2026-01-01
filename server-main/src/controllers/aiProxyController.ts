import { Request, Response } from 'express';
import { callPythonAI } from '../services/pythonService.js';

export const analyzeContent = async (req: Request, res: Response) => {
    try {
        const result = await callPythonAI('analyze', req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'AI Service call failed' });
    }
};
