import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthDietDto } from './create-health-diet.dto';

export class UpdateHealthDietDto extends PartialType(CreateHealthDietDto) {}
