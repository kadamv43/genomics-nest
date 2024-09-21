// blog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery } from './gallery.schema';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel('Gallery') private readonly blogModel: Model<Gallery>,
  ) {}

  async createBlog(data): Promise<Gallery> {
    const newBlog = new this.blogModel(data);
    return newBlog.save();
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

  async getBlogById(blogId: string): Promise<Gallery> {
    return this.blogModel.findById(blogId).exec();
  }

  async update(id: string, updateBlogDto: UpdateGalleryDto): Promise<Gallery> {
    const updatedBlog = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, {
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
