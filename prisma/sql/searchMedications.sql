SELECT id, name, "chemicalComposition", "samplePhotoUrl",
      ts_rank(to_tsvector('portuguese', name || ' ' || "chemicalComposition" || ' ' || usefulness), query) AS rank
FROM "Medication",
      plainto_tsquery('portuguese', $1) query
WHERE to_tsvector('portuguese', name || ' ' || "chemicalComposition" || ' ' || usefulness) @@ query
ORDER BY rank DESC