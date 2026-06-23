import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateRangeOrdered', async: false })
export class IsDateRangeOrderedConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string, args: ValidationArguments): boolean {
    const [fromProperty] = args.constraints as [string];
    const from = (args.object as Record<string, unknown>)[fromProperty];
    if (!from || !value) return true; // obrigatoriedade tratada à parte
    return new Date(from as string).getTime() <= new Date(value).getTime();
  }

  defaultMessage(): string {
    return 'createdAtFrom deve ser menor ou igual a createdAtTo';
  }
}
