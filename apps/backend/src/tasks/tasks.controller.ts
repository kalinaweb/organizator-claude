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
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: { title: string; description?: string; listId: string },
  ) {
    return this.tasksService.create(body.listId, req.user.id, {
      title: body.title,
      description: body.description,
    });
  }

  @Get()
  findAll(@Request() req, @Query('listId') listId: string) {
    return this.tasksService.findAll(listId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      title?: string;
      description?: string;
      completed?: boolean;
      order?: number;
    },
  ) {
    return this.tasksService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }
}
