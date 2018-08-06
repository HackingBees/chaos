CREATE TABLE `chaosdb`.`sys_apps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NULL,
  `description` TEXT(500) NULL,
  `active` TINYINT NULL,
  PRIMARY KEY (`id`));
