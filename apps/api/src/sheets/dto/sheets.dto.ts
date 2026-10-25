import {
  IsArray, IsDefined, IsInt, IsString, IsUUID, Length, Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSheetDto {
  @IsString() @Length(1, 100) name!: string;
}

export class CellChangeDto {
  @IsInt() @Min(0) row!: number;
  @IsInt() @Min(0) column!: number;
  @IsDefined() value!: unknown;
  @IsInt() @Min(0) expectedVersion!: number;
}

export class PatchCellsDto {
  @IsUUID() mutationId!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CellChangeDto)
  changes!: CellChangeDto[];
}