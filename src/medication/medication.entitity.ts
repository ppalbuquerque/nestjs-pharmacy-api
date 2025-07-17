import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Medication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', name: 'chemical_composition' })
  chemicalComposition: string;

  @Column({ type: 'int', name: 'stock_availability' })
  stockAvailability: number;

  @Column({ type: 'varchar', name: 'shelf_location' })
  shelfLocation: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'box_price' })
  boxPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'varchar' })
  usefulness: string;

  @Column({ type: 'varchar', name: 'sample_photo_url' })
  samplePhotoUrl: string;

  @Column({ type: 'text', name: 'dosage_instructions' })
  dosageInstructions: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
