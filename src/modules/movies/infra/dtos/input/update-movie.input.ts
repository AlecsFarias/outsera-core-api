import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieInput {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Title of the movie',
    required: false,
    example: 'Updated Movie Title',
  })
  title?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'Year of the movie',
    required: false,
    example: 2024,
  })
  year?: number;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: 'Studios that produced the movie',
    required: false,
    example: ['Updated Studio 1', 'Updated Studio 2'],
  })
  studios?: string[];

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: 'Producers of the movie',
    required: false,
    example: ['Updated Producer 1', 'Updated Producer 2'],
  })
  producers?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the movie won an award',
    required: false,
    example: true,
  })
  winner?: boolean;
}
