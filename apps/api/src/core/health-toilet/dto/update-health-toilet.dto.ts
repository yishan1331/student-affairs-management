import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthToiletDto } from './create-health-toilet.dto';

export class UpdateHealthToiletDto extends PartialType(CreateHealthToiletDto) {}
