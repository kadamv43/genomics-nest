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
    const size = params.size;
    const skip = params.page * params.size;

    let query = {};
    if (params.q) {
      const regex = new RegExp(params.q, 'i'); // 'i' makes it case-insensitive
      query = {
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { email: { $regex: regex } },
        ],
      };
    }
    const blogs = await this.blogModel
      .find(query)
      .skip(skip)
      .limit(size)
      .exec();
    const totalRecords = await this.blogModel.countDocuments().exec();
    return { data: blogs, total: totalRecords };
  }

  async getImagesByGalleryId(id: string) {
    return this.blogModel.find({id:id}).exec();
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

