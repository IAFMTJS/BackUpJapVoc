import { NextApiRequest, NextApiResponse } from 'next';
import { handleDictionaryRequest } from '../../api/dictionary';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
    // Increase timeout to 30 seconds
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set a longer timeout
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=30');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000);
    });

    // Race between the actual request and the timeout
    const response = await Promise.race([
      handleDictionaryRequest(new Request(req.url!)),
      timeoutPromise
    ]) as Response;

    const data = await response.json();
    
    // Copy headers from the response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in dictionary API route:', error);
    
    // Handle specific error types
    if (error.message === 'Request timeout') {
      return res.status(504).json({ 
        error: 'Request timed out',
        message: 'The server took too long to respond. Please try again.'
      });
    }
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request aborted',
        message: 'The request was aborted. Please try again.'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
} 