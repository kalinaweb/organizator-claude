import { IsString } from 'class-validator';

export class ResortTaskListDto {
  @IsString()
  listId: string;
}
