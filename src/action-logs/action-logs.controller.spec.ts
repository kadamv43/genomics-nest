import { ActionLogsController } from './action-logs.controller';

describe('ActionLogsController', () => {
  it('delegates reads to the service and exposes no write handlers', () => {
    const service: any = {
      findAll: jest.fn().mockReturnValue('list'),
      findOne: jest.fn().mockReturnValue('one'),
    };
    const controller = new ActionLogsController(service);

    expect(controller.findAll({ page: '0' })).toBe('list');
    expect(controller.findOne('id1')).toBe('one');
    expect(service.findAll).toHaveBeenCalledWith({ page: '0' });
    expect(service.findOne).toHaveBeenCalledWith('id1');

    const handlers = Object.getOwnPropertyNames(ActionLogsController.prototype);
    expect(handlers.sort()).toEqual(['constructor', 'findAll', 'findOne']);
  });
});
