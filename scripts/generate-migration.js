
const { spawnSync } = require('child_process');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Missing migration name.\nUsage: npm run migration:generate AddUsersTable');
  process.exit(1);
}

const outputPath = `src/database/migrations/${migrationName}`;

console.log(`📦 Generating migration: ${outputPath}`);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(
  npmCmd,
  ['run', 'typeorm', '--', 'migration:generate', outputPath, '-d', 'src/database/data-source.ts'],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error('❌ Error executing TypeORM:', result.error.message);
  process.exit(result.status || 1);
}

process.exit(result.status);
