import { cookies } from 'next/headers';
import UsersTable from './users-table';
import { getUserIdFromHeaders } from '@/lib/auth-utils';

export default async function UsersPage() {
  const userId = await getUserIdFromHeaders();
  const canDeleteOthers = process.env.CAN_DELETE_OTHER_USERS === 'true';

  return <UsersTable currentUserId={userId} canDeleteOthers={canDeleteOthers} />;
} 