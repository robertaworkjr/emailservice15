import cron from 'cron';
import EmailGenerator from './EmailGenerator.js';

class CleanupService {
  constructor() {
    this.cleanupJob = null;
  }

  initialize() {
    // Run cleanup every 5 minutes
    const cronPattern = `*/${process.env.CLEANUP_INTERVAL_MINUTES || 5} * * * *`;
    
    this.cleanupJob = new cron.CronJob(cronPattern, async () => {
      try {
        console.log('Running email cleanup...');
        const deletedCount = await EmailGenerator.cleanupExpiredEmails();
        console.log(`Cleanup completed. Deleted ${deletedCount} expired emails.`);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    this.cleanupJob.start();
    console.log('Cleanup service initialized');
  }

  stop() {
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      console.log('Cleanup service stopped');
    }
  }
}

export default new CleanupService();