import { IsString, Length } from 'class-validator';

export class CreateWorkbookDto {
  @IsString() @Length(1, 100) name!: string;
}