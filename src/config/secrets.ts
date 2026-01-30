import * as fs from 'fs';
import { env } from './env';

const DB_PASSWORD = fs.readFileSync(env.MONGODB_PASSWORD_FILE, 'utf8').trim();

export { DB_PASSWORD };