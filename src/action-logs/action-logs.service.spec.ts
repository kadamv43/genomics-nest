import { Test, TestingModule } from '@nestjs/testing';
import { ActionLogsService } from './action-logs.service';

describe('ActionLogsService', () => {
  let service: ActionLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionLogsService],
    }).compile();

    service = module.get<ActionLogsService>(ActionLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
