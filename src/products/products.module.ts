import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';

@Module({
  imports:[
     MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),

  ],
  exports:[MongooseModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
