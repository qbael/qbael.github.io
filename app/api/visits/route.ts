import { getD1 } from '@/db';
import {
  handleVisitRequest,
  INCREMENT_VIEW_COUNT_SQL,
  READ_VIEW_COUNT_SQL,
} from '@/lib/visits';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleVisitRequest(request, () => {
    const db = getD1();
    return {
      read: () =>
        db.prepare(READ_VIEW_COUNT_SQL).bind(1).first<{ total: number }>(),
      increment: () =>
        db.prepare(INCREMENT_VIEW_COUNT_SQL).first<{ total: number }>(),
    };
  });
}
