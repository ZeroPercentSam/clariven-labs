import 'dotenv/config';
import { deleteTestUsers, truncateTestData } from './helpers';

export default async function globalTeardown() {
  await deleteTestUsers();
  await truncateTestData();
}
