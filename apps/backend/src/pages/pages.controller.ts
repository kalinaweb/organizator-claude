import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Post()
  create(@Request() req, @Body() body: { title: string }) {
    return this.pagesService.create(req.user.id, body.title);
  }

  @Get()
  findAll(@Request() req) {
    return this.pagesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.pagesService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { title: string },
  ) {
    return this.pagesService.update(id, req.user.id, body.title);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.pagesService.remove(id, req.user.id);
  }
}
