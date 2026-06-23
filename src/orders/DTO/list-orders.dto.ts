import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  Validate,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order.entity';
import { IsDateRangeOrderedConstraint } from './validators/is-date-range-ordered.validator';

const dateRangeProvided = (o: ListOrdersDTO) =>
  o.createdAtFrom !== undefined || o.createdAtTo !== undefined;

export enum OrderSort {
  CREATED_AT_DESC = 'createdAt_desc',
  CREATED_AT_ASC = 'createdAt_asc',
  TOTAL_VALUE_DESC = 'totalValue_desc',
  TOTAL_VALUE_ASC = 'totalValue_asc',
}

export class ListOrdersDTO {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsUUID()
  checkoutId?: string;

  @ValidateIf(dateRangeProvided)
  @IsNotEmpty({
    message: 'createdAtFrom é obrigatório quando createdAtTo é informado',
  })
  @IsISO8601()
  createdAtFrom?: string;

  @ValidateIf(dateRangeProvided)
  @IsNotEmpty({
    message: 'createdAtTo é obrigatório quando createdAtFrom é informado',
  })
  @IsISO8601()
  @Validate(IsDateRangeOrderedConstraint, ['createdAtFrom'])
  createdAtTo?: string;

  @IsOptional()
  @IsEnum(OrderSort)
  sort?: OrderSort = OrderSort.CREATED_AT_DESC;
}
