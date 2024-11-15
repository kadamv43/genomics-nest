import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryImage } from './gallery-image.schema';
import { UpdateGalleryImageDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryImagesService {
  constructor(
    @InjectModel('GalleryImage')
    private readonly blogModel: Model<GalleryImage>,
  ) {}

  async createBlog(data) {
    console.log(data)
    return await this.blogModel.insertMany(data);
    // return newBlog.save();
  }

  async findAll(params) {
    const size = params?.size ?? 100;
    const skip = params.page ? params.page * params.size : 0;
   
    const blogs = await this.blogModel
      .find()
      .populate('gallery')
      .skip(skip)
      .limit(size)
      .exec();
    const totalRecords = await this.blogModel.countDocuments().exec();
    return { data: blogs, total: totalRecords };
  }

  async getImagesByGalleryId(id: string) {
    return this.blogModel.find({gallery:id}).exec();
  }

  async update(
    id: string,
    updateGalleryImageDto: UpdateGalleryImageDto,
  ): Promise<GalleryImage> {
    const updatedBlog = await this.blogModel
      .findByIdAndUpdate(id, updateGalleryImageDto, {
        new: true,
      })
      .exec();
    if (!updatedBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return updatedBlog;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
  }
}

