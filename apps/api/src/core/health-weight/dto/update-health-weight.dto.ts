import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthWeightDto } from './create-health-weight.dto';

export class UpdateHealthWeightDto extends PartialType(CreateHealthWeightDto) {}
