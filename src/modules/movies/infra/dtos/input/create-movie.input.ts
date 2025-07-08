import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieInput {
  @IsNumber()
  @ApiProperty({ type: Number, description: 'Year of the movie' })
  year: number;

  @IsString()
  @ApiProperty({ type: String, description: 'Title of the movie' })
  title: string;

  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: 'Studios that produced the movie',
  })
  studios: string[];

  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'Producers of the movie' })
  producers: string[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the movie won an award',
    required: false,
  })
  winner?: boolean;
}
