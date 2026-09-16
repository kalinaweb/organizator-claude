import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private listsService: ListsService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: { title: string; pageId: string },
  ) {
    return this.listsService.create(body.pageId, body.title, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query('pageId') pageId: string) {
    return this.listsService.findAll(pageId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.listsService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { title?: string; order?: number },
  ) {
    return this.listsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.listsService.remove(id, req.user.id);
  }
}
