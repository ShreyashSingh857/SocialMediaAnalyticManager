import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export const callPythonAI = async (endpoint: string, data: any) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/${endpoint}`, data);
        return response.data;
    } catch (error) {
        console.error('Error connecting to AI service:', error);
        throw error;
    }
};
