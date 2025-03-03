import { Test, TestingModule } from '@nestjs/testing';
import { ActionLogsController } from './action-logs.controller';

describe('ActionLogsController', () => {
  let controller: ActionLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionLogsController],
    }).compile();

    controller = module.get<ActionLogsController>(ActionLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
