require('dotenv').config({ path: '.env.development.local' });

const { execSync } = require('child_process');

console.log('Current DB URL:', process.env.DATABASE_URL);

execSync('npx prisma migrate dev', { stdio: 'inherit' });
