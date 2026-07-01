CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'PDA', 'USER') NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user` (`username`, `password`, `role`)
VALUES
    ('admin', '$2a$10$bEuvJhGP3Vb5ri0qB2fYxO1g77Q3SidZLXoOtz8x.qBIBxNTX8u.i', 'ADMIN'),
    ('pda', '$2a$10$cIu3D5ZX2ZLfPjHfPbqhEOwBzJAf3wY.oR7udHbaiqxzNM5PDFCg6', 'ADMIN')
ON DUPLICATE KEY UPDATE
    `password` = VALUES(`password`),
    `role` = VALUES(`role`);
