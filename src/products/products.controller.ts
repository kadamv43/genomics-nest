import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { Product } from './product.schema';
import { ProductsService } from './products.service';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { formatDate } from 'date-fns';
import { EmailService } from 'src/email/email.service';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private emailService: EmailService,
  ) {}
  @Post()
  //   @Roles(Role.Admin)
  async create(@Body() productDto: Product) {
    const product: any = await this.productsService.create(productDto);

    if (product) {
      let data = await this.productsService.findOne(product?._id);
      console.log(data);
      let subject = `New Service Added`;
      let newData = this.modifyProductData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './create_service')
        .catch((e) => {
          console.error(e);
        });
    }

    return product;
  }

  @Get('/')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() productDto: Product) {
    const product = await this.productsService.update(id, productDto);

    if (product) {
      let data = await this.productsService.findOne(id);
      console.log(data);
      let subject = `Service Update (${data?.name})`;
      let newData = this.modifyProductData(data);
      this.emailService
        .sendMailTemplateToAdmin(subject, newData, './edit_service')
        .catch((e) => {
          console.error(e);
        });
    }
    return product;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  modifyProductData(data) {
    let newData = {};
    newData['name'] = data?.name;
    newData['price'] = data?.price;
    return newData;
  }
}
