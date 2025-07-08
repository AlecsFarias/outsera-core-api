import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ListInput {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Search term to filter results',
    required: false,
  })
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    type: Number,
    description: 'Page number for pagination',
    required: false,
    minimum: 1,
    example: 1,
  })
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    type: Number,
    description: 'Number of items per page',
    required: false,
    minimum: 1,
    example: 10,
  })
  perPage?: number;
}
