import { Test, TestingModule } from '@nestjs/testing';
import { GalleryImagesService } from './gallery-images.service';

describe('GalleryImagesService', () => {
  let service: GalleryImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GalleryImagesService],
    }).compile();

    service = module.get<GalleryImagesService>(GalleryImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
