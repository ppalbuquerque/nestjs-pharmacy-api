import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { Medication } from './medication.entitity';

@EventSubscriber()
export class MedicationSubscriber
  implements EntitySubscriberInterface<Medication>
{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  listenTo(): Function | string {
    return Medication;
  }

  async afterInsert(event: InsertEvent<Medication>): Promise<void> {
    return await this.updateSearchVector(event);
  }

  async afterUpdate(event: UpdateEvent<Medication>): Promise<void> {
    await this.updateSearchVector(event);
  }

  private async updateSearchVector(
    event: UpdateEvent<Medication> | InsertEvent<Medication>,
  ): Promise<void> {
    if (!event.entity) return;

    await event.manager.query(
      `
            UPDATE medication
            SET "full_text_search" =
                setweight(to_tsvector('ptbr', coalesce(medication.usefulness, '')), 'A') ||
                setweight(to_tsvector('ptbr', coalesce(medication.name, '')), 'B') ||
                setweight(to_tsvector('ptbr', coalesce(medication.chemical_composition, '')), 'C')
            WHERE medication.id = $1
        `,
      [event.entity.id],
    );
  }
}
