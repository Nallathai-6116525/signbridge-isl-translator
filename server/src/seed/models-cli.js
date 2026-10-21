import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { exportSharedModels, importSharedModels } from './sharedModels.js';

const command = process.argv[2];
if (!['export', 'import'].includes(command)) {
  console.error('Usage: node src/seed/models-cli.js export|import');
  process.exit(1);
}

let connected = false;
try {
  await connectDB();
  connected = true;
  if (command === 'export') {
    await exportSharedModels();
  } else {
    const admin = await User.findOne({ email: env.admin.email }).select('_id').lean();
    await importSharedModels({ createdBy: admin?._id });
  }
} catch (error) {
  console.error(`[models] ${command} failed:`, error.message);
  process.exitCode = 1;
} finally {
  if (connected) {
    try {
      await disconnectDB();
    } catch (error) {
      console.error('[models] Failed to disconnect from MongoDB:', error.message);
      process.exitCode = 1;
    }
  }
}
