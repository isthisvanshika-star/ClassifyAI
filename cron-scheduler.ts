//imp  WILL RUN AUTOMATICALLY IN PRODUCTION || AWS SERVER ENVIRONMENT

import cron from 'node-cron';
import fetch from 'node-fetch';

const CRON_SECRET = process.env.CRON_SECRET;
const API_ENDPOINT = "http://localhost:3000/api/cron/finalize-attendance";

if (!CRON_SECRET) {
    console.error("CRON_SECRET is not defined in your environment variables.");
    process.exit(1); // Exit the script if the secret is missing
}
cron.schedule('* * * * *', async () => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] Running cron job: Finalizing attendance sessions...`);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json() as { message?: string; error?: string };

    if (!response.ok) {
      throw new Error(data.error || 'API call failed');
    }

    console.log(`[${timestamp}] Cron job finished successfully:`, data.message);

  } catch (error: any) {
    console.error(`[${timestamp}] Cron job failed:`, error.message);
  }
});

console.log("Cron scheduler started. It will trigger the finalize attendance API every minute.");