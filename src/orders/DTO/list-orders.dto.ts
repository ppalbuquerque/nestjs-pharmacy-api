import { IsEnum, IsISO8601, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order.entity';

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

  @IsOptional()
  @IsISO8601()
  createdAtFrom?: string;

  @IsOptional()
  @IsISO8601()
  createdAtTo?: string;

  @IsOptional()
  @IsEnum(OrderSort)
  sort?: OrderSort = OrderSort.CREATED_AT_DESC;
}
