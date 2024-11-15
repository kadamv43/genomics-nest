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
    const size = params?.size ?? 100;
    const skip = params.page ? params.page * params.size :0
   
    const blogs = await this.blogModel
      .find(params?.status ? {status:params?.status}:{})
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
