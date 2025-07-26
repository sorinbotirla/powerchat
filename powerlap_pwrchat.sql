
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `pwr_conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `windowuuid` varchar(255) NOT NULL,
  `created` bigint(20) NOT NULL,
  `updated` bigint(20) NOT NULL,
  `operator` varchar(255) NOT NULL,
  `clientname` varchar(255) NOT NULL,
  `clientemail` varchar(255) NOT NULL,
  `clientid` int(255) UNSIGNED NOT NULL,
  `operatorread` int(11) NOT NULL DEFAULT 0,
  `newmessages` int(255) NOT NULL DEFAULT 0,
  `color` varchar(50) NOT NULL DEFAULT '#000000',
  `operatoranswered` int(10) NOT NULL DEFAULT 0,
  `waitingforclientresponse` int(10) NOT NULL DEFAULT 0,
  `deviceagent` text NOT NULL,
  `deviceclienttype` varchar(255) NOT NULL,
  `deviceclientname` varchar(255) NOT NULL,
  `deviceclientversion` varchar(255) NOT NULL,
  `deviceclientengine` varchar(255) NOT NULL,
  `deviceosname` varchar(255) NOT NULL,
  `deviceosversion` varchar(255) NOT NULL,
  `deviceosplatform` varchar(255) NOT NULL,
  `devicename` varchar(255) NOT NULL,
  `devicebrandname` varchar(255) NOT NULL,
  `devicemodel` varchar(255) NOT NULL,
  `deviceisdesktop` int(11) NOT NULL DEFAULT 0,
  `deviceismobile` int(11) NOT NULL DEFAULT 0,
  `deviceistablet` int(11) NOT NULL DEFAULT 0,
  `deviceisios` int(11) NOT NULL DEFAULT 0,
  `deviceisandroid` int(11) NOT NULL DEFAULT 0,
  `deviceid` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pwr_messages` (
  `id` int(11) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `messageid` varchar(255) NOT NULL,
  `message` mediumtext NOT NULL,
  `created` bigint(20) NOT NULL,
  `author` varchar(255) NOT NULL DEFAULT 'Client',
  `files` mediumtext NOT NULL,
  `seen` int(10) NOT NULL DEFAULT 0,
  `emailed` int(10) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `pwr_conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`);

ALTER TABLE `pwr_messages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `messageid` (`messageid`);

ALTER TABLE `pwr_conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `pwr_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

