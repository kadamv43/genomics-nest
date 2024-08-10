import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductDocument } from './product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: Product): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return product;
  }

  async findByField(queryData): Promise<Product> {
    const product = await this.productModel.findOne(queryData).exec();
    return product;
  }

  async update(id: string, updateUserDto: Product): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedProduct;
  }

}
