import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { Product } from './product.schema';
import { ProductsService } from './products.service';
import { Role } from 'src/auth/roles.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post()
//   @Roles(Role.Admin)
  create(@Body() productDto: Product) {
    return this.productsService.create(productDto);
  }

  @Get('/')
  findAll() {
    console.log('ddd');
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() productDto: Product) {
    return this.productsService.update(id, productDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
