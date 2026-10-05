import { NotFoundException } from '@nestjs/common';
import { ActionLogsService } from './action-logs.service';

function makeModel(rows: any[] = [], total = 0) {
  const chain: any = {};
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.lean = jest.fn().mockReturnValue(chain);
  chain.exec = jest.fn().mockResolvedValue(rows);
  return {
    chain,
    find: jest.fn().mockReturnValue(chain),
    countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(total) }),
    findById: jest.fn().mockReturnValue(chain),
    create: jest.fn().mockResolvedValue({}),
  };
}

describe('ActionLogsService', () => {
  it('builds filters, caps page size and sorts newest first', async () => {
    const model = makeModel([{ a: 1 }], 1);
    const service = new ActionLogsService(model as any);

    const res = await service.findAll({
      module: 'invoice',
      action: 'UPDATE',
      role: 'staff',
      user: 'u1',
      size: '9999',
      page: '2',
      from: '2026-10-05',
      to: '2026-10-05',
    });

    const query = model.find.mock.calls[0][0];
    expect(query).toMatchObject({ module: 'invoice', action: 'UPDATE', user_role: 'staff', user_id: 'u1' });
    expect(query.created_at.$gte).toEqual(new Date('2026-10-05'));
    expect(query.created_at.$lte.getHours()).toBe(23); // "to" includes the whole day
    expect(model.chain.limit).toHaveBeenCalledWith(100);
    expect(model.chain.skip).toHaveBeenCalledWith(200);
    expect(model.chain.sort).toHaveBeenCalledWith({ created_at: -1 });
    expect(res).toEqual({ data: [{ a: 1 }], total: 1 });
  });

  it('escapes regex characters in the search text', async () => {
    const model = makeModel();
    const service = new ActionLogsService(model as any);
    await service.findAll({ q: '(a+' });
    const regex: RegExp = model.find.mock.calls[0][0].$or[0].user_name;
    expect(regex.test('xx (a+ yy')).toBe(true);
  });

  it('ignores invalid dates and falls back to defaults', async () => {
    const model = makeModel();
    const service = new ActionLogsService(model as any);
    await service.findAll({ from: 'nonsense', size: 'abc' });
    expect(model.find.mock.calls[0][0].created_at).toBeUndefined();
    expect(model.chain.limit).toHaveBeenCalledWith(10);
  });

  it('record() never throws if the database write fails', async () => {
    const model = makeModel();
    model.create.mockRejectedValue(new Error('db down'));
    const service = new ActionLogsService(model as any);
    await expect(service.record({ module: 'x', action: 'CREATE' })).resolves.toBeUndefined();
  });

  it('findOne() throws NotFound for a missing log', async () => {
    const model = makeModel();
    model.chain.exec.mockResolvedValue(null);
    const service = new ActionLogsService(model as any);
    await expect(service.findOne('abc')).rejects.toBeInstanceOf(NotFoundException);
  });
});
