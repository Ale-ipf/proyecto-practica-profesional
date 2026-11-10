ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('student', 'owner', 'admin') NOT NULL;
