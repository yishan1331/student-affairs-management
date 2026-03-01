import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthSymptomDto } from './create-health-symptom.dto';

export class UpdateHealthSymptomDto extends PartialType(CreateHealthSymptomDto) {}
