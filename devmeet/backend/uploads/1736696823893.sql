CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('folder','code','image','video','document') NOT NULL,
  `content` longtext DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `files` (`id`, `project_id`, `parent_id`, `name`, `type`, `content`, `path`, `size`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 4, NULL, '', 'folder', NULL, NULL, NULL, 10, '2025-01-09 14:22:31', '2025-01-10 19:37:40'),
(2, 35, NULL, 'Project_2_Files', 'folder', NULL, '/project_2', NULL, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(3, 4, 1, 'Frontend', 'folder', NULL, '/project_1/frontend', NULL, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(4, 4, 1, 'Backend', 'folder', NULL, '/project_1/backend', NULL, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(5, 4, 3, 'index.html', 'code', '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello World</body></html>', '/project_1/frontend/index.html', 1024, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(6, 4, 3, 'styles.css', 'code', 'body { font-family: Arial; }', '/project_1/frontend/styles.css', 512, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(7, 4, 4, 'api.js', 'code', 'const express = require(\"express\"); const app = express();', '/project_1/backend/api.js', 2048, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(8, 4, 4, 'config.json', 'document', '{ \"database\": \"mysql\", \"user\": \"admin\" }', '/project_1/backend/config.json', 128, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(9, 35, 2, 'logo.png', 'image', NULL, '/project_2/logo.png', 4096, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31'),
(10, 35, 2, 'video.mp4', 'video', NULL, '/project_2/video.mp4', 8192, 10, '2025-01-09 14:22:31', '2025-01-09 14:22:31');

ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `created_by` (`created_by`);
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `files_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `files` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `files_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;