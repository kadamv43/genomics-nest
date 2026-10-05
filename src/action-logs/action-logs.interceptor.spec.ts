import { of, throwError, lastValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'src/auth/jwt.constants';
import { ActionLogsInterceptor } from './action-logs.interceptor';

const flush = () => new Promise((r) => setTimeout(r, 20));
const ID = '64b7f0f0f0f0f0f0f0f0f0f0';

function setup(docs: Record<string, any[]> = {}) {
  const record = jest.fn().mockResolvedValue(undefined);
  // each findById call returns the next queued snapshot (before, then after)
  const queue = { ...docs };
  const model = (name: string) => ({
    findById: () => ({
      lean: () => ({ exec: () => Promise.resolve((queue[name] || []).shift() ?? null) }),
    }),
  });
  const connection: any = {
    models: new Proxy({}, { get: (_t, name: string) => model(name) }),
  };
  const interceptor = new ActionLogsInterceptor({ record } as any, connection);
  return { interceptor, record };
}

function ctx(req: any) {
  return { getType: () => 'http', switchToHttp: () => ({ getRequest: () => req }) } as any;
}

const staff = { userId: 'u1', first_name: 'Sam', last_name: 'Staff', email: 's@x.com', role: 'staff' };
const run = async (i: ActionLogsInterceptor, req: any, response: any = {}) => {
  await lastValueFrom(i.intercept(ctx(req), { handle: () => of(response) } as any));
  await flush();
};

describe('ActionLogsInterceptor', () => {
  it('logs an UPDATE with only the changed fields', async () => {
    const { interceptor, record } = setup({
      Product: [
        { _id: ID, name: 'A', price: '100', updated_at: 1 },
        { _id: ID, name: 'A', price: '250', updated_at: 2 },
      ],
    });
    await run(interceptor, { method: 'PATCH', originalUrl: `/products/${ID}`, params: { id: ID }, user: staff, headers: {} });

    expect(record).toHaveBeenCalledTimes(1);
    const entry = record.mock.calls[0][0];
    expect(entry).toMatchObject({ module: 'products', action: 'UPDATE', user_name: 'Sam Staff', user_role: 'staff', entity_label: 'A' });
    expect(entry.changes).toEqual([{ field: 'price', old: '100', new: '250' }]);
  });

  it('does not log an update that changed nothing', async () => {
    const same = { _id: ID, name: 'A', price: '100' };
    const { interceptor, record } = setup({ Product: [same, { ...same }] });
    await run(interceptor, { method: 'PATCH', originalUrl: `/products/${ID}`, params: { id: ID }, user: staff, headers: {} });
    expect(record).not.toHaveBeenCalled();
  });

  it('logs CREATE with the new record and DELETE with the removed record', async () => {
    const created = setup({ Doctor: [{ _id: ID, first_name: 'Dr', last_name: 'Who', email: 'd@x.com' }] });
    await run(created.interceptor, { method: 'POST', originalUrl: '/doctors', params: {}, user: staff, headers: {} }, { _id: ID });
    expect(created.record.mock.calls[0][0]).toMatchObject({ action: 'CREATE', module: 'doctors', entity_id: ID });
    expect(created.record.mock.calls[0][0].changes.find((c: any) => c.field === 'email')).toEqual({ field: 'email', old: null, new: 'd@x.com' });

    const deleted = setup({ Blog: [{ _id: ID, title: 'Gone', status: 'Active' }] });
    await run(deleted.interceptor, { method: 'DELETE', originalUrl: `/blogs/${ID}`, params: { id: ID }, user: staff, headers: {} });
    const entry = deleted.record.mock.calls[0][0];
    expect(entry).toMatchObject({ action: 'DELETE', module: 'blogs', entity_label: 'Gone' });
    expect(entry.changes.find((c: any) => c.field === 'title')).toEqual({ field: 'title', old: 'Gone', new: null });
  });

  it('redacts passwords', async () => {
    const { interceptor, record } = setup({
      User: [
        { _id: ID, email: 'u@x.com', password: 'hash-old' },
        { _id: ID, email: 'u@x.com', password: 'hash-new' },
      ],
    });
    await run(interceptor, { method: 'PATCH', originalUrl: `/users/${ID}`, params: { id: ID }, user: staff, headers: {} });
    expect(record.mock.calls[0][0].changes).toEqual([{ field: 'password', old: '***', new: '***' }]);
    expect(JSON.stringify(record.mock.calls[0][0])).not.toContain('hash-');
  });

  it('ignores reads, unauthenticated requests, and non-audited modules', async () => {
    const { interceptor, record } = setup();
    await run(interceptor, { method: 'GET', originalUrl: '/products', params: {}, user: staff, headers: {} });
    await run(interceptor, { method: 'POST', originalUrl: '/products', params: {}, headers: {} }, { _id: ID });
    await run(interceptor, { method: 'POST', originalUrl: '/otp/send-otp', params: {}, user: staff, headers: {} });
    await run(interceptor, { method: 'POST', originalUrl: '/web/appointment', params: {}, user: staff, headers: {} });
    await run(interceptor, { method: 'POST', originalUrl: '/auth/verify-otp', params: {}, user: staff, headers: {} });
    expect(record).not.toHaveBeenCalled();
  });

  it('identifies the user from a valid Bearer token on unguarded routes, and rejects a forged one', async () => {
    const good = jwt.sign({ sub: 'u9', first_name: 'Dee', last_name: 'Doc', email: 'dd@x.com', role: 'doctor' }, JWT_SECRET);
    const a = setup({ Banner: [{ _id: ID, title: 'B', status: 'Active' }] });
    await run(a.interceptor, { method: 'DELETE', originalUrl: `/banners/${ID}`, params: { id: ID }, headers: { authorization: `Bearer ${good}` } });
    expect(a.record.mock.calls[0][0]).toMatchObject({ user_name: 'Dee Doc', user_role: 'doctor' });

    const forged = jwt.sign({ sub: 'x', first_name: 'Evil', role: 'admin' }, 'wrong-secret');
    const b = setup({ Banner: [{ _id: ID, title: 'B' }] });
    await run(b.interceptor, { method: 'DELETE', originalUrl: `/banners/${ID}`, params: { id: ID }, headers: { authorization: `Bearer ${forged}` } });
    expect(b.record).not.toHaveBeenCalled();
  });

  it('logs successful logins and failed logins (without the password)', async () => {
    const token = jwt.sign({ sub: 'u1', first_name: 'Sam', last_name: 'Staff', email: 's@x.com', role: 'staff' }, JWT_SECRET);
    const ok = setup();
    await run(ok.interceptor, { method: 'POST', originalUrl: '/auth/login', params: {}, headers: {}, body: { email: 's@x.com', password: 'secret' } }, { accessToken: token });
    expect(ok.record.mock.calls[0][0]).toMatchObject({ action: 'LOGIN', user_name: 'Sam Staff', module: 'auth' });

    const bad = setup();
    const err: any = Object.assign(new Error('nope'), { getStatus: () => 401 });
    await expect(
      lastValueFrom(bad.interceptor.intercept(
        ctx({ method: 'POST', originalUrl: '/auth/login', params: {}, headers: {}, body: { email: 's@x.com', password: 'secret' } }),
        { handle: () => throwError(() => err) } as any,
      )),
    ).rejects.toBe(err);
    await flush();
    const entry = bad.record.mock.calls[0][0];
    expect(entry).toMatchObject({ action: 'LOGIN_FAILED', user_email: 's@x.com', status_code: 401 });
    expect(JSON.stringify(entry)).not.toContain('secret');
  });

  it('never breaks the request when logging itself fails', async () => {
    const { interceptor, record } = setup({ Product: [{ _id: ID, name: 'A' }, { _id: ID, name: 'B' }] });
    record.mockRejectedValue(new Error('boom'));
    await expect(
      run(interceptor, { method: 'PATCH', originalUrl: `/products/${ID}`, params: { id: ID }, user: staff, headers: {} }, { ok: true }),
    ).resolves.toBeUndefined();
  });
});
