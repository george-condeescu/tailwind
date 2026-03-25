-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: registratura
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_user_id` int DEFAULT NULL,
  `actor_org_unit_id` bigint DEFAULT NULL,
  `action` enum('CREATE','UPDATE','DELETE','SEND','RECEIVE','FORWARD','RETURN','LOGIN','LOGOUT','FAILED_LOGIN') NOT NULL,
  `entity_type` enum('DOCUMENT','DOCUMENT_REVISION','DOCUMENT_ATTACHMENT','DOCUMENT_CIRCULATIE','ORG_UNIT','USER','USER_MEMBERSHIP') NOT NULL,
  `entity_id` bigint unsigned DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `correlation_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_time` (`created_at`),
  KEY `idx_audit_actor_time` (`actor_user_id`,`created_at`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_action` (`action`,`created_at`),
  KEY `idx_audit_corr` (`correlation_id`),
  KEY `fk_audit_org_unit` (`actor_org_unit_id`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_org_unit` FOREIGN KEY (`actor_org_unit_id`) REFERENCES `org_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_events`
--

LOCK TABLES `audit_events` WRITE;
/*!40000 ALTER TABLE `audit_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(1000) DEFAULT NULL,
  `data_modif` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `persoana` varchar(50) DEFAULT NULL,
  `document_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_documentcomments` (`document_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_attachments`
--

DROP TABLE IF EXISTS `document_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(1000) NOT NULL,
  `sha256` char(64) DEFAULT NULL,
  `uploaded_by_user_id` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL,
  `uploaded_at` datetime DEFAULT NULL,
  `original_name` varchar(255) NOT NULL DEFAULT 'unknown.pdf',
  PRIMARY KEY (`id`),
  KEY `idx_att_rev` (`document_id`),
  KEY `fk_att_creator` (`uploaded_by_user_id`),
  CONSTRAINT `fk_att_creator` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_att_rev` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_attachments`
--

LOCK TABLES `document_attachments` WRITE;
/*!40000 ALTER TABLE `document_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_circulation`
--

DROP TABLE IF EXISTS `document_circulation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_circulation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `action` enum('SEND','RECEIVE','FORWARD','RETURN','CLOSE','CANCEL') NOT NULL,
  `from_user_id` int DEFAULT NULL,
  `to_user_id` int DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `data_intrare` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_iesire` datetime DEFAULT NULL,
  `citit` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_circ_doc_time` (`document_id`,`createdAt`,`id`),
  KEY `idx_circ_to_user` (`to_user_id`,`createdAt`),
  KEY `idx_circ_from_user` (`from_user_id`,`createdAt`),
  CONSTRAINT `fk_circ_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_circ_from_user` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_circ_to_user` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_circulation`
--

LOCK TABLES `document_circulation` WRITE;
/*!40000 ALTER TABLE `document_circulation` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_circulation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nr_inreg` varchar(20) NOT NULL,
  `created_by_user_id` int NOT NULL,
  `content_snapshot` mediumtext NOT NULL,
  `note` varchar(1000) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL,
  `nr_revizie` tinyint NOT NULL,
  `current_user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rev_doc_time` (`nr_inreg`,`createdAt`),
  KEY `idx_rev_editor` (`created_by_user_id`),
  KEY `fk_rev_current` (`current_user_id`),
  CONSTRAINT `fk_rev_current` FOREIGN KEY (`current_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rev_doc` FOREIGN KEY (`nr_inreg`) REFERENCES `registers` (`nr_inreg`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rev_editor` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_counters`
--

DROP TABLE IF EXISTS `id_counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_counters` (
  `departament` varchar(10) NOT NULL,
  `year` int NOT NULL,
  `last_number` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`departament`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_counters`
--

LOCK TABLES `id_counters` WRITE;
/*!40000 ALTER TABLE `id_counters` DISABLE KEYS */;
/*!40000 ALTER TABLE `id_counters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `org_unit_roles`
--

DROP TABLE IF EXISTS `org_unit_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `org_unit_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `org_unit_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `role` enum('DIRECTOR','SEF_SERVICIU','SEF_COMPARTIMENT') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_role_unit` (`org_unit_id`,`role`),
  CONSTRAINT `org_unit_roles_ibfk_1` FOREIGN KEY (`org_unit_id`) REFERENCES `org_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `org_unit_roles`
--

LOCK TABLES `org_unit_roles` WRITE;
/*!40000 ALTER TABLE `org_unit_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `org_unit_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `org_units`
--

DROP TABLE IF EXISTS `org_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `org_units` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('DIRECTIE','SERVICIU','COMPARTIMENT','CONDUCERE') DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_org_unit_parent` (`parent_id`),
  KEY `idx_org_unit_type` (`type`),
  CONSTRAINT `fk_org_unit_parent` FOREIGN KEY (`parent_id`) REFERENCES `org_units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `org_units`
--

LOCK TABLES `org_units` WRITE;
/*!40000 ALTER TABLE `org_units` DISABLE KEYS */;
INSERT INTO `org_units` VALUES (1,'Directia Economica','DIRECTIE',7,'DE',1),(2,'Directia Juridica','DIRECTIE',7,'DJ',1),(3,'Directia Tehnica si Administrarea Teritoriului','DIRECTIE',7,'DTAT',1),(4,'Directia Urbanism si Amenajarea Teritoriului','DIRECTIE',7,'DUAT',1),(5,'Directia Management si Administratie Publica','DIRECTIE',7,'DMAP',1),(6,'Directia Investitii, Proiecte si Achizitii Publice','DIRECTIE',7,'DIPAP',1),(7,'Conducere','CONDUCERE',51,'COND',1),(8,'Audit Public Intern','COMPARTIMENT',7,'API',1),(9,'Compartimentul control intern managerial','COMPARTIMENT',7,'CCIM',1),(10,'Serviciul juridic, contencios si transparenta decizionala','SERVICIU',2,'SJCTD',1),(11,'Compartiment juridic si contencios','COMPARTIMENT',10,'CJC',1),(12,'Compartimentul transparenta decizitionala','COMPARTIMENT',10,'CTD',1),(13,'Serviciul monitorizare proceduri administrative si registratura','SERVICIU',2,'SMPAR',1),(14,'Compartimentul monitorizare proceduri administrative si relatia cu consilierii judeteni','COMPARTIMENT',13,'CMPARCJ',1),(15,'Compartimentul registratura, petitii, relatii cu publicul, secretariat ATOP','COMPARTIMENT',13,'CRPRPSATOP',1),(16,'Serviciul financiar contabilitate, gestiune si administrativ','SERVICIU',1,'SFCGA',1),(17,'Compartimentul financiar contabilitate','COMPARTIMENT',16,'CFC',1),(18,'Compartimentul gestiune administrativ','COMPARTIMENT',16,'CGA',1),(19,'Serviciul buget, finante si baze de date','SERVICIU',1,'SBFBD',1),(20,'Serviciul resurse umane salarizare','SERVICIU',1,'SRUS',1),(21,'Serviciul logistic','SERVICIU',1,'SL',1),(22,'Compartimentul informatic','COMPARTIMENT',21,'CI',1),(23,'Compartimentul deservire parc auto','COMPARTIMENT',21,'CDPA',1),(24,'Compartimentul Urbanism','COMPARTIMENT',4,'CU',1),(25,'Compartimentul Amenajarea Teritoriului','COMPARTIMENT',4,'CAT',1),(26,'Serviciul autorizarea constructiilor, disciplina in constructii, protectia muncii si a mediului','SERVICIU',4,'SACDCPMM',1),(27,'Compartimentul autorizarea constructiilor','COMPARTIMENT',26,'CAC',1),(28,'Compartimentul disciplina in constructii','COMPARTIMENT',26,'CDC',1),(29,'Compartimentul protecția muncii și a mediului','COMPARTIMENT',26,'CPMM',1),(30,'Compartimentul ghișeu unic de eficiență energetică','COMPARTIMENT',6,'CGUEE',1),(31,'Serviciul proiecte fonduri europene','SERVICIU',6,'SPFE',1),(32,'Serviciul achiziții publice și contracte','SERVICIU',6,'SAPC',1),(33,'Compartimentul achiziții publice și  achiziții directe','COMPARTIMENT',6,'CAPAD',1),(34,'Serviciul administrare și întreținere drumuri','SERVICIU',3,'SAID',1),(35,'Serviciul evidență patrimoniu și utilități','SERVICIU',3,'SEPU',1),(36,'Compartimentul autoritatea județeană de transport','COMPARTIMENT',35,'CAJT',1),(37,'Compartimentul structuri asociative','COMPARTIMENT',35,'CSA',1),(38,'Compartimentul gestiunea patrimoniului','COMPARTIMENT',35,'CGP',1),(39,'Compartimentul educație, cultură, tineret și comunicare','COMPARTIMENT',5,'CECTC',1),(40,'Serviciul de sănătate publică și administrație publică locală','SERVICIU',5,'SSPAPL',1),(41,'Compartimentul de sănătate publică','COMPARTIMENT',40,'CSP',1),(42,'Compartimentul administrație publică locală','COMPARTIMENT',40,'CAPL',1),(43,'Compartimentul de cooperare internă și internațională','COMPARTIMENT',40,'CCII',1),(51,'Consiliul Judetean Teleorman','CONDUCERE',NULL,'CJT',1);
/*!40000 ALTER TABLE `org_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partner`
--

DROP TABLE IF EXISTS `partner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `denumire` varchar(255) DEFAULT NULL,
  `adresa` varchar(255) DEFAULT NULL,
  `cui` varchar(20) DEFAULT NULL,
  `reg_com` varchar(50) DEFAULT NULL,
  `tara` varchar(50) DEFAULT NULL,
  `judet` varchar(50) DEFAULT NULL,
  `localitate` varchar(50) DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partner`
--

LOCK TABLES `partner` WRITE;
/*!40000 ALTER TABLE `partner` DISABLE KEYS */;
INSERT INTO `partner` VALUES (1,'SC WISE ALTERNATIVE SRL','Str. Londra 20A Et. 1 Ap. 9 Cod 011763 ','37449905','J2022019203409','Romania','Sector 1','Bucuresti',NULL,NULL,NULL,'2026-02-23 16:39:02','2026-03-16 15:45:26'),(2,'SC AVA MOKANU SRL',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-23 16:39:02',NULL),(3,'RNP ROMSILVA - DS TR OCOLUL SILVIC ALEXANDRIA','sos. Turnu Magurele, nr. 1',NULL,NULL,'Romania','Teleorman','Alexandria','0247 312 238',NULL,NULL,'2026-02-23 16:39:02','2026-03-16 15:58:11'),(4,'MUZEUL JUDETEAN TELEORMAN','str. 1848, nr. 1','6491810',NULL,'Romania','Teleorman','Alexandria','0247 31 47 61','muzjudteleorman@yahoo.com',NULL,'2026-02-23 16:39:02','2026-03-16 15:34:15'),(5,'SPITAL PSIHIATRIE POROSCHIA','str. Dunarii, nr. 245','4568438',NULL,'Romania','Teleorman','Poroschia','0247318877','sp_poro_inc@yahoo.com',NULL,'2026-02-23 16:39:02','2026-03-16 15:22:57'),(6,'SJU ALEXANDRIA','str. Libertatii, nr. 1','4253650',NULL,'Romania','Teleorman','Alexandria','0247306711','secretariat@spitalulalexandria.ro',NULL,'2026-02-23 16:39:02','2026-03-16 15:19:14'),(7,'CASA SOCIALA A CONSTRUCTORILOR','Str. Episcopul Timuș nr. 25, sect. 1','11054090',NULL,'Romania','Sector 1','Bucuresti','(021) 317 89 02','office@casoc.ro',NULL,'2026-02-23 16:39:02','2026-03-16 15:36:17'),(8,'INSPECTORATUL JUDETEAN DE CONSTRUCTII','str. Independentei, nr. 4 bis','4469116',NULL,'Romania','Teleorman','Alexandria','0247 311 414','teleorman@isc.gov.ro',NULL,'2026-02-23 16:39:02','2026-03-16 15:29:46'),(9,'SC MINDSOFT IT SOLUTIONS SRL ','Piata Unirii, nr. 4','43164376 ','J2020001342323','Romania','Sibiu','Sibiu','+40 770 372 976','contact@mindsoft.ro','contact','2026-03-16 16:05:48','2026-03-16 16:05:48'),(10,'IT PLUS SRL ','Str. Dunarii 212 Bl. PATRIA Sc. C Et. 9 Ap. 126 Cod 140040','23919799','J34/411/2008','Romania','Teleorman','Alexandria','0347-809.123','itplus@gmail.com','Decebal Traian','2026-03-16 16:19:34','2026-03-16 16:19:34'),(11,'AND COMPUTER SRL',' 	Str. Libertatii 211 Bl. L9 Et. P Cod 140017 ','8658444','J34/347/1996','Romania','Teleorman','Alexandria','0247-317.623','office@andcomputer.ro','office','2026-03-16 16:30:18','2026-03-16 16:30:18');
/*!40000 ALTER TABLE `partner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registers`
--

DROP TABLE IF EXISTS `registers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registers` (
  `nr_inreg` varchar(20) NOT NULL,
  `observatii` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `partener_id` int NOT NULL,
  `obiectul` varchar(255) NOT NULL,
  `cod_ssi` varchar(255) NOT NULL,
  `cod_angajament` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL,
  `status` enum('DRAFT','ACTIVE','CLOSED','CANCELED') NOT NULL DEFAULT 'DRAFT',
  PRIMARY KEY (`nr_inreg`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registers`
--

LOCK TABLES `registers` WRITE;
/*!40000 ALTER TABLE `registers` DISABLE KEYS */;
/*!40000 ALTER TABLE `registers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_membership`
--

DROP TABLE IF EXISTS `user_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_membership` (
  `user_id` int NOT NULL,
  `org_unit_id` bigint NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`,`org_unit_id`),
  KEY `org_unit_id` (`org_unit_id`),
  CONSTRAINT `user_membership_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_membership_ibfk_2` FOREIGN KEY (`org_unit_id`) REFERENCES `org_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_membership`
--

LOCK TABLES `user_membership` WRITE;
/*!40000 ALTER TABLE `user_membership` DISABLE KEYS */;
INSERT INTO `user_membership` VALUES (52,19,'2026-03-10',NULL,'2026-03-10 08:02:00','2026-03-10 08:02:00'),(53,19,'2026-03-10',NULL,'2026-03-10 08:06:02','2026-03-10 08:06:02'),(54,15,'2026-03-10',NULL,'2026-03-10 08:07:36','2026-03-10 08:07:36'),(55,11,'2026-03-16',NULL,'2026-03-16 07:15:23','2026-03-16 07:41:21'),(56,19,'2026-03-16',NULL,'2026-03-16 08:01:29','2026-03-16 08:01:29'),(57,17,'2026-03-16',NULL,'2026-03-16 08:05:25','2026-03-16 08:05:25'),(58,19,'2026-03-16',NULL,'2026-03-16 08:07:21','2026-03-16 08:07:21');
/*!40000 ALTER TABLE `user_membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL DEFAULT 'John Doe',
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`username`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (52,'george.condeescu','george.condeescu@gmail.com','$2b$10$EoBkzzylHRTcCaKGpxsdS.M7fV7r6//jO/vVvfh30fIc5f/AIvV56',1,'2026-03-10 08:02:00','2026-03-10 08:02:00',1,'George Condeescu'),(53,'florin.giurcanas','f_giurcanas@yahoo.com','$2b$10$dE5XU49UiJiqfhrWlgQy0eYOLvaXaLHR3J6qabGdlAiezMzq.PpTK',0,'2026-03-10 08:06:02','2026-03-10 08:06:02',1,'Florin Giurcanas'),(54,'petre.cernat','petre.cernat@gmail.com','$2b$10$xxiFxsb.fVG2Hb52FAdXjOXE.YsqA8ZyhelcqObRuUVbRJ4j2J5Au',0,'2026-03-10 08:07:36','2026-03-10 08:07:36',1,'Petre Cernat'),(55,'dicu.marius','dicu.marius@yahoo.com','$2b$10$3L51pjyLswajciEXTzRDheQ.7yUabbWIRhAdwZEaN.1sc59IQiW8C',0,'2026-03-16 07:15:23','2026-03-16 07:41:21',1,'Dicu Marius'),(56,'florin.burcea','florin.burcea@gmail.com','$2b$10$SZnIs6WNIh223mh3P2IQe.7zYuW.QJnlwSbJF.JJ/2tf00DiUI3Qq',0,'2026-03-16 08:01:29','2026-03-16 08:01:29',1,'Florin Burcea'),(57,'marius.coman','marius.coman@gmail.com','$2b$10$d47biNsmMW1Y3jWLvecLwePaxbnmsL4O1S8EQ8LYWKVzzIK2k1GZG',0,'2026-03-16 08:05:25','2026-03-16 08:05:25',1,'Marius Coman'),(58,'stefan.nina','stefan.nina@gmail.com','$2b$10$EvpAQ.EjEOQoYi2crHkvM.79AE/YDAdASaiD7w1BKuelCIeobqnq6',0,'2026-03-16 08:07:21','2026-03-16 08:07:21',1,'Stefan Nina');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-18 15:35:23
