ALTER TABLE `Institutions`
  ADD COLUMN `busStops` JSON NULL;

UPDATE `Institutions`
SET `busStops` = JSON_ARRAY()
WHERE `busStops` IS NULL;

ALTER TABLE `Institutions`
  MODIFY COLUMN `busStops` JSON NOT NULL;
