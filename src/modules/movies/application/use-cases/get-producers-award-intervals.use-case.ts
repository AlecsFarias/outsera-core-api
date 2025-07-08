import { UseCase } from 'src/modules/shared/application/use-case/use-case';
import {
  MoviesRepository,
  MaxAndMinResponse,
} from '../../domain/repositories/movies.repository';
import { InternalError } from 'src/modules/shared/application/errors/internal-erro';

export type GetProducersAwardIntervalsUseCaseInput = never;

export type GetProducersAwardIntervalsUseCaseOutput = MaxAndMinResponse;

export class GetProducersAwardIntervalsUseCase
  implements
    UseCase<
      GetProducersAwardIntervalsUseCaseInput,
      GetProducersAwardIntervalsUseCaseOutput
    >
{
  constructor(private readonly movieRepository: MoviesRepository) {}

  async execute(): Promise<GetProducersAwardIntervalsUseCaseOutput> {
    try {
      const result =
        await this.movieRepository.getProducersWithMaxAndMinAwardIntervals();

      return result;
    } catch (err) {
      throw new InternalError(
        `GetProducersAwardIntervalsUseCase: Error retrieving producers award intervals: ${err.message}`,
      );
    }
  }
}
