// src/app/api/send-feedback/route.ts
/**
 * Next.js API route for handling feedback form submissions
 *
 * This route processes feedback submissions by:
 * 1. Validating the submission data
 * 2. Logging the feedback to structured log files
 * 3. Providing appropriate responses to the client
 *
 * The implementation uses file-based logging to ensure feedback is never lost.
 */

import fs from 'node:fs';
import path from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';

// Define interface for feedback data to ensure type safety
interface FeedbackData {
  name: string;
  email: string;
  feedbackType: string;
  message: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

// Note: We've removed the LoggingError interface that was unused and causing linting errors
// If specific error handling for logging is needed, we can use more specific error handling in the code

/**
 * Logs feedback data to structured log files
 *
 * @param data - The feedback data to log
 * @returns Promise that resolves when logging is complete
 */
async function logFeedback(data: FeedbackData): Promise<void> {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create monthly log files for better organization
    const now = new Date();
    const month = now.toISOString().slice(0, 7); // Format: YYYY-MM
    const logFile = path.join(logsDir, `feedback-${month}.log`);

    // Format the log entry with timestamp and data
    const timestamp = now.toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n\n`;

    // Append to log file
    fs.appendFileSync(logFile, logEntry);

    // Also maintain an all-time feedback log for easy access to all submissions
    const allFeedbackFile = path.join(logsDir, 'all-feedback.log');
    fs.appendFileSync(allFeedbackFile, logEntry);
  } catch (_error) {
    throw new Error('Failed to save feedback to logs');
  }
}

/**
 * POST handler for feedback submissions
 *
 * @param req - The incoming request object
 * @returns NextResponse with appropriate status and message
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse form data from request body
    const formData = await req.json();
    const { name, email, feedbackType, message } = formData;

    // Validate required field
    if (!message || message.trim() === '') {
      return NextResponse.json(
        {
          error: 'Message is required',
        },
        { status: 400 }
      );
    }

    // Get additional information from request
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Prepare the feedback data with all available information
    const feedbackData: FeedbackData = {
      name: name || 'Anonymous',
      email: email || 'Not provided',
      feedbackType: feedbackType || 'general',
      message,
      timestamp: new Date().toISOString(),
      userAgent,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : 'unknown',
    };

    // Log the feedback data to files
    await logFeedback(feedbackData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback! It has been recorded successfully.',
      },
      { status: 200 }
    );
  } catch (_error: unknown) {
    // Return a user-friendly error message
    return NextResponse.json(
      {
        error: 'Failed to process feedback. Please try again later or contact us directly.',
      },
      { status: 500 }
    );
  }
}
