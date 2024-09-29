import { Test, TestingModule } from '@nestjs/testing';
import { GalleryImagesController } from './gallery-images.controller';

describe('GalleryImagesController', () => {
  let controller: GalleryImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalleryImagesController],
    }).compile();

    controller = module.get<GalleryImagesController>(GalleryImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
