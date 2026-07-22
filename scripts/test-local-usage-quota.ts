import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { reserveLocalUsage } from '../src/lib/local-usage-quota';
import { AccountServiceError } from '../src/lib/account-entitlement-client';
import { getAccountCenterStatus } from '../src/lib/account-center';

async function main() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'knowtrail-local-quota-'));
  process.env.LOCAL_USAGE_QUOTA_PATH = path.join(dir, 'usage.json');
  process.env.LOCAL_USAGE_QUOTA_IMAGE_DAILY = '1';
  process.env.KNOWTRAIL_OBSERVABILITY_HASH_KEY = 'test-only-local-quota-hash-key-1234567890';
  try {
  assert.equal(getAccountCenterStatus().billingReservationReady, true);
  assert.equal(getAccountCenterStatus().billingMode, 'local_quota');
  const released = await reserveLocalUsage({ memberId: 'guest-a', productArea: 'ai.image', units: 1 });
  await assert.rejects(
    () => reserveLocalUsage({ memberId: 'guest-a', productArea: 'ai.image', units: 1 }),
    error => error instanceof AccountServiceError && error.status === 402,
  );
  await released.release();
  const settled = await reserveLocalUsage({ memberId: 'guest-a', productArea: 'ai.image', units: 1 });
  await settled.settle();
  await assert.rejects(
    () => reserveLocalUsage({ memberId: 'guest-a', productArea: 'ai.image', units: 1 }),
    error => error instanceof AccountServiceError && error.status === 402,
  );
  const otherGuest = await reserveLocalUsage({ memberId: 'guest-b', productArea: 'ai.image', units: 1 });
  await otherGuest.release();
  console.log(JSON.stringify({ ok: true, checked: ['local billing readiness', 'daily quota', 'release recovery', 'settled usage', 'member isolation'] }, null, 2));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
