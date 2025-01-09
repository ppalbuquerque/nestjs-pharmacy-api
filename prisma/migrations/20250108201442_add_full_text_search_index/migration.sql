-- Create Index
CREATE INDEX medication_fts_idx ON "Medication" USING gin(to_tsvector('portuguese', name || ' ' || "chemicalComposition" || ' ' || usefulness));