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
  `entity_id` varchar(255) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_time` (`created_at`),
  KEY `idx_audit_actor_time` (`actor_user_id`,`created_at`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_action` (`action`,`created_at`),
  KEY `fk_audit_org_unit` (`actor_org_unit_id`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_org_unit` FOREIGN KEY (`actor_org_unit_id`) REFERENCES `org_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_events`
--

LOCK TABLES `audit_events` WRITE;
/*!40000 ALTER TABLE `audit_events` DISABLE KEYS */;
INSERT INTO `audit_events` VALUES (1,56,NULL,'LOGIN','USER','56','Utilizatorul florin.burcea s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:07:06'),(2,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:25:23'),(3,52,19,'LOGIN','USER','52','Utilizatorul george.condeescu s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:50:07'),(4,NULL,NULL,'LOGOUT','USER',NULL,'Utilizatorul Unknown s-a deconectat.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:54:03'),(5,NULL,NULL,'FAILED_LOGIN','USER','57','Tentativă de login eșuată pentru email: marius.coman@gmail.com. Invalid credentials.',NULL,'{\"email\": \"marius.coman@gmail.com\", \"attempt_at\": \"2026-03-24T10:54:40.137Z\"}','::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:54:40'),(6,NULL,NULL,'FAILED_LOGIN','USER','57','Tentativă de login eșuată pentru email: marius.coman@gmail.com. Invalid credentials.',NULL,'{\"email\": \"marius.coman@gmail.com\", \"attempt_at\": \"2026-03-24T10:55:44.609Z\"}','::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:55:44'),(7,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 10:56:01'),(8,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 11:57:47'),(9,57,NULL,'CREATE','DOCUMENT','DE20260014','Registru nou creat cu nr_inreg: DE20260014.',NULL,'{\"status\": \"DRAFT\", \"cod_ssi\": \"02A800130203030\", \"user_id\": 57, \"nr_inreg\": \"DE20260014\", \"obiectul\": \"Contract achizitie piese auto\", \"createdAt\": \"2026-03-24T11:58:45.594Z\", \"updatedAt\": \"2026-03-24T11:58:45.594Z\", \"observatii\": \"Achizitie piese auto Dacia\", \"partener_id\": 12, \"cod_angajament\": \"DSFDSFDSFSDFDSFDSFDSF\"}','::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 11:58:45'),(10,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:09:51'),(11,57,NULL,'CREATE','DOCUMENT','DE20260015','Registru nou creat cu nr_inreg: DE20260015.',NULL,'{\"status\": \"DRAFT\", \"cod_ssi\": \"DSFDSFDS\", \"user_id\": 57, \"nr_inreg\": \"DE20260015\", \"obiectul\": \"Autorizatii contruire\", \"createdAt\": \"2026-03-24T13:15:55.484Z\", \"updatedAt\": \"2026-03-24T13:15:55.485Z\", \"observatii\": \"observatii\", \"partener_id\": 8, \"cod_angajament\": \"AAB33HA3EMN/AAB\"}','::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:15:55'),(12,NULL,NULL,'LOGOUT','USER',NULL,'Utilizatorul Unknown s-a deconectat.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:16:23'),(13,52,19,'LOGIN','USER','52','Utilizatorul george.condeescu s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:16:30'),(14,NULL,NULL,'LOGOUT','USER',NULL,'Utilizatorul Unknown s-a deconectat.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:46:57'),(15,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:47:03'),(16,NULL,NULL,'LOGOUT','USER',NULL,'Utilizatorul Unknown s-a deconectat.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:55:10'),(17,52,19,'LOGIN','USER','52','Utilizatorul george.condeescu s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 13:55:15'),(18,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 14:56:38'),(19,NULL,NULL,'LOGOUT','USER',NULL,'Utilizatorul Unknown s-a deconectat.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 14:56:43'),(20,52,19,'LOGIN','USER','52','Utilizatorul george.condeescu s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 14:56:49'),(21,52,NULL,'DELETE','DOCUMENT','DE20260015','Registru cu nr_inreg: DE20260015 șters.','{\"status\": \"DRAFT\", \"cod_ssi\": \"DSFDSFDS\", \"partner\": {\"id\": 8, \"cui\": \"4469116\", \"tara\": \"Romania\", \"email\": \"teleorman@isc.gov.ro\", \"judet\": \"Teleorman\", \"adresa\": \"str. Independentei, nr. 4 bis\", \"contact\": null, \"reg_com\": null, \"telefon\": \"0247 311 414\", \"denumire\": \"INSPECTORATUL JUDETEAN DE CONSTRUCTII\", \"createdAt\": \"2026-02-23T16:39:02.000Z\", \"updatedAt\": \"2026-03-16T15:29:46.000Z\", \"localitate\": \"Alexandria\"}, \"user_id\": 57, \"nr_inreg\": \"DE20260015\", \"obiectul\": \"Autorizatii contruire\", \"createdAt\": \"2026-03-24T13:15:55.000Z\", \"updatedAt\": \"2026-03-24T13:15:55.000Z\", \"observatii\": \"observatii\", \"partener_id\": 8, \"cod_angajament\": \"AAB33HA3EMN/AAB\"}',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-24 14:59:04'),(22,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-25 12:33:57'),(23,52,19,'LOGIN','USER','52','Utilizatorul george.condeescu s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-25 13:11:11'),(24,56,19,'LOGIN','USER','56','Utilizatorul florin.burcea s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-25 13:13:36'),(25,59,34,'LOGIN','USER','59','Utilizatorul claudia.pana s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-25 13:24:38'),(26,NULL,NULL,'LOGOUT','USER',NULL,'Utilizatorul Unknown s-a deconectat.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-25 13:24:48'),(27,52,19,'LOGIN','USER','52','Utilizatorul george.condeescu s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-25 13:42:02'),(28,57,16,'LOGIN','USER','57','Utilizatorul marius.coman s-a autentificat cu succes.',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-26 08:29:13'),(29,57,NULL,'CREATE','DOCUMENT','DE20260016','Registru nou creat cu nr_inreg: DE20260016.',NULL,'{\"status\": \"DRAFT\", \"cod_ssi\": \"DSFDSFDS\", \"user_id\": 57, \"nr_inreg\": \"DE20260016\", \"obiectul\": \"dsadsadsa\", \"createdAt\": \"2026-03-26T08:29:37.712Z\", \"updatedAt\": \"2026-03-26T08:29:37.717Z\", \"observatii\": \"dsdsa\", \"partener_id\": 11, \"cod_angajament\": \"ssadsad\"}','::ffff:127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0','2026-03-26 08:29:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (13,'Solicit rezolvarea urgenta.','2026-03-19 10:36:57','George Condeescu',32),(14,'rezolvare urgenta','2026-03-20 09:50:08','Marius Coman',42),(15,'Rezolvare urgenta','2026-03-20 10:33:52','Marius Coman',43),(16,'Vreau informare','2026-03-20 10:34:05','Marius Coman',43),(17,'De rezolvat urgent','2026-03-23 16:44:05','Claudia Pană',44);
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_attachments`
--

LOCK TABLES `document_attachments` WRITE;
/*!40000 ALTER TABLE `document_attachments` DISABLE KEYS */;
INSERT INTO `document_attachments` VALUES (24,32,'fb64c7d9e815d0db36803a00e5b31865','application/pdf','uploads/fb64c7d9e815d0db36803a00e5b31865','5954048098f70d82d671ac5b0ac0c8645d5cc0003eb932f34d95e8c78dcfdf34',52,'2026-03-19 09:48:49',NULL,NULL,'FF-360408-2.pdf'),(25,32,'1fc02addbcb5f59e8ebd0803a28b7179','application/pdf','uploads/1fc02addbcb5f59e8ebd0803a28b7179','b0ee90687bba7e329a8c2aa9547228244b1db75c4683ef9634c5f25badca4552',52,'2026-03-19 10:37:26',NULL,NULL,'gavanescu.pdf'),(26,32,'06803737dcdd1b3d4ddc6a5c91729923','application/pdf','uploads/06803737dcdd1b3d4ddc6a5c91729923','143e5bf83d6da1f06e5b09b045119ac209fc105f585091314a21f83c974c7179',53,'2026-03-19 10:39:53',NULL,NULL,'P.V. sedinta-25-06-2025.pdf'),(27,40,'77e9c5cb451f126c2fbaffab15853a08','application/pdf','uploads/77e9c5cb451f126c2fbaffab15853a08','0dd240cc90262f45b13cc157ead22269b3e5a900ea24265895fe08a6b491c77a',52,'2026-03-19 16:41:00',NULL,NULL,'linuxnotesforprofessionals.pdf'),(28,42,'92c694499d2125b164c434ef814f3c92','application/pdf','uploads/92c694499d2125b164c434ef814f3c92','5bd3926acb89133984a877d861bd65270a12acf4cec0a4fe9f5cee44b74cf318',57,'2026-03-20 10:09:58',NULL,NULL,'Introductory-Statistics-With-R-2nd-Edition.pdf'),(29,42,'7284b07a9d94b7839dd9142efccffabf','application/pdf','uploads/7284b07a9d94b7839dd9142efccffabf','12305dc7d7874b906fdbbec29d93363860b12e9c6685a6c38f1717e0d41abfb6',53,'2026-03-20 10:10:55',NULL,NULL,'Zhao_R_and_data_mining.pdf'),(30,43,'b98adbc45dd7e30ac75c842a6c5ee162','application/pdf','uploads/b98adbc45dd7e30ac75c842a6c5ee162','6930076e660dfe810e76ce892b87bef50eba1e25ec8409b3725dbf549495c1cc',57,'2026-03-20 10:33:25',NULL,NULL,'Data Mining Algorithms, Explained using R - Wiley ( PDFDrive ).pdf'),(31,43,'7826dd38f239e442989a90863f2f00cc','application/pdf','uploads/7826dd38f239e442989a90863f2f00cc','5dec447bd495876c551ae8949623dbedc268bd4bcd4f3edcfb13d8c4dc3e14a5',57,'2026-03-20 10:34:28',NULL,NULL,'Introduction to Machine Learning.pdf'),(32,44,'8e5693508b16aa212b9ebc264b529bc7','application/pdf','uploads/8e5693508b16aa212b9ebc264b529bc7','143e5bf83d6da1f06e5b09b045119ac209fc105f585091314a21f83c974c7179',59,'2026-03-23 17:08:42',NULL,NULL,'P.V. sedinta-25-06-2025.pdf'),(33,44,'39884b5f4e44b4a7c6cc67add79d21bf','application/pdf','uploads/39884b5f4e44b4a7c6cc67add79d21bf','143e5bf83d6da1f06e5b09b045119ac209fc105f585091314a21f83c974c7179',57,'2026-03-23 17:09:54',NULL,NULL,'P.V. sedinta-25-06-2025.pdf');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_circulation`
--

LOCK TABLES `document_circulation` WRITE;
/*!40000 ALTER TABLE `document_circulation` DISABLE KEYS */;
INSERT INTO `document_circulation` VALUES (34,32,'SEND',52,53,'Optional note for the recipient....','2026-03-19 09:48:49','2026-03-19 10:37:53','2026-03-19 09:48:49','2026-03-19 10:37:53','2026-03-19 10:36:17'),(35,32,'SEND',53,57,'Optional note for the recipient....','2026-03-19 10:37:53','2026-03-19 10:40:12','2026-03-19 10:37:53','2026-03-19 10:40:12','2026-03-19 10:39:24'),(36,32,'CLOSE',57,NULL,'Optional note for the recipient....','2026-03-19 10:40:12','2026-03-19 11:37:34','2026-03-19 10:40:12','2026-03-19 11:37:34','2026-03-19 10:41:09'),(44,40,'SEND',52,53,'Optional note for the recipient....','2026-03-19 15:44:24','2026-03-19 16:46:18','2026-03-19 15:44:24','2026-03-19 16:46:18','2026-03-19 16:37:56'),(46,40,'SEND',53,57,'Optional note for the recipient....','2026-03-19 16:46:18','2026-03-20 10:11:24','2026-03-19 16:46:18','2026-03-20 10:11:24','2026-03-19 16:50:05'),(47,42,'SEND',57,53,'Optional note for the recipient....','2026-03-20 09:43:54','2026-03-20 10:10:10','2026-03-20 09:43:54','2026-03-20 10:10:10','2026-03-20 09:44:19'),(48,42,'SEND',53,52,'Optional note for the recipient....','2026-03-20 10:10:10','2026-03-20 10:11:06','2026-03-20 10:10:10','2026-03-20 10:11:06','2026-03-20 10:10:34'),(49,42,'RECEIVE',52,NULL,'Optional note for the recipient....','2026-03-20 10:11:06','2026-03-20 10:28:21','2026-03-20 10:11:06',NULL,'2026-03-20 10:28:21'),(50,40,'SEND',57,56,'Optional note for the recipient....','2026-03-20 10:11:24','2026-03-20 10:20:10','2026-03-20 10:11:24','2026-03-20 10:20:10','2026-03-20 10:13:52'),(51,40,'RECEIVE',56,NULL,'Optional note for the recipient....','2026-03-20 10:20:10','2026-03-20 10:23:25','2026-03-20 10:20:10',NULL,'2026-03-20 10:23:25'),(52,43,'SEND',57,53,'Optional note for the recipient....','2026-03-20 10:33:25','2026-03-20 10:34:38','2026-03-20 10:33:25','2026-03-20 10:34:38','2026-03-20 10:33:33'),(53,43,'SEND',53,56,'Optional note for the recipient....','2026-03-20 10:34:38','2026-03-20 10:35:33','2026-03-20 10:34:38','2026-03-20 10:35:33','2026-03-20 10:35:03'),(54,43,'RECEIVE',56,NULL,'Optional note for the recipient....','2026-03-20 10:35:33','2026-03-20 10:35:50','2026-03-20 10:35:33',NULL,'2026-03-20 10:35:50'),(55,44,'SEND',59,57,'Optional note for the recipient....','2026-03-23 16:43:40','2026-03-23 17:09:06','2026-03-23 16:43:40','2026-03-23 17:09:06','2026-03-23 16:43:48'),(56,44,'RECEIVE',57,NULL,'Optional note for the recipient....','2026-03-23 17:09:06','2026-03-23 17:09:27','2026-03-23 17:09:06',NULL,'2026-03-23 17:09:27');
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
  `current_user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rev_doc_time` (`nr_inreg`,`createdAt`),
  KEY `idx_rev_editor` (`created_by_user_id`),
  KEY `fk_rev_current` (`current_user_id`),
  CONSTRAINT `fk_rev_current` FOREIGN KEY (`current_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rev_doc` FOREIGN KEY (`nr_inreg`) REFERENCES `registers` (`nr_inreg`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rev_editor` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (32,'DE20260001',52,'{\"nr_inreg\":\"DE20260001\",\"observatii\":\"contract servicii mentenanta\",\"user_id\":52,\"partener_id\":9,\"obiectul\":\"Contract mentenanta nr. 64/2025\",\"cod_ssi\":\"02A800130203030\",\"cod_angajament\":\"AAB33HA3EMN/AAB\",\"status\":\"DRAFT\",\"createdAt\":\"2026-03-19T09:47:54.000Z\",\"updatedAt\":\"2026-03-19T09:47:54.000Z\",\"partner\":{\"id\":9,\"denumire\":\"SC MINDSOFT IT SOLUTIONS SRL \",\"adresa\":\"Piata Unirii, nr. 4\",\"cui\":\"43164376 \",\"reg_com\":\"J2020001342323\",\"tara\":\"Romania\",\"judet\":\"Sibiu\",\"localitate\":\"Sibiu\",\"telefon\":\"+40 770 372 976\",\"email\":\"contact@mindsoft.ro\",\"contact\":\"contact\",\"createdAt\":\"2026-03-16T16:05:48.000Z\",\"updatedAt\":\"2026-03-16T16:05:48.000Z\"}}','Document closed','2026-03-19 09:48:49','2026-03-19 09:48:49',1,NULL),(40,'DE20260007',52,'{\"nr_inreg\":\"DE20260007\",\"observatii\":\"Reparatii masina Duster\",\"user_id\":52,\"partener_id\":12,\"obiectul\":\"Contract reparatie Duster\",\"cod_ssi\":\"02A800130203030\",\"cod_angajament\":\"AAB33HA3EMN/AAB\",\"status\":\"DRAFT\",\"createdAt\":\"2026-03-19T14:19:33.000Z\",\"updatedAt\":\"2026-03-19T14:19:33.000Z\",\"partner\":{\"id\":12,\"denumire\":\"EUROCAR SERVICE\",\"adresa\":\"Strada București, Nr. 187\",\"cui\":\"RO7213707\",\"reg_com\":\" J1994000802344\",\"tara\":\"Romania\",\"judet\":\"Teleorman\",\"localitate\":\"Alexandria\",\"telefon\":\"0247.317.095\",\"email\":\"eurocaralex@eurocartr.ro\",\"contact\":\"POPESCU\",\"createdAt\":\"2026-03-19T13:44:45.000Z\",\"updatedAt\":\"2026-03-19T13:44:45.000Z\"}}','Prima revizie','2026-03-19 15:44:24','2026-03-19 15:44:24',1,56),(42,'DE20260008',57,'{\"nr_inreg\":\"DE20260008\",\"observatii\":\"Contract achizitie rechizite\",\"user_id\":57,\"partener_id\":11,\"obiectul\":\"Contract achizitie rechizite anul 2026\",\"cod_ssi\":\"02A800130203030\",\"cod_angajament\":\"AAB33HA3EMN/AAB\",\"status\":\"DRAFT\",\"createdAt\":\"2026-03-20T09:42:49.000Z\",\"updatedAt\":\"2026-03-20T09:42:49.000Z\",\"partner\":{\"id\":11,\"denumire\":\"AND COMPUTER SRL\",\"adresa\":\" \\tStr. Libertatii 211 Bl. L9 Et. P Cod 140017 \",\"cui\":\"8658444\",\"reg_com\":\"J34/347/1996\",\"tara\":\"Romania\",\"judet\":\"Teleorman\",\"localitate\":\"Alexandria\",\"telefon\":\"0247-317.623\",\"email\":\"office@andcomputer.ro\",\"contact\":\"office\",\"createdAt\":\"2026-03-16T16:30:18.000Z\",\"updatedAt\":\"2026-03-16T16:30:18.000Z\"}}','Revizie initiala','2026-03-20 09:43:54','2026-03-20 09:43:54',1,52),(43,'DE20260009',57,'{\"nr_inreg\":\"DE20260009\",\"observatii\":\"Contract achizitie PC-uri\",\"user_id\":57,\"partener_id\":11,\"obiectul\":\"Contract achizitie PC-uri\",\"cod_ssi\":\"02A800130203030\",\"cod_angajament\":\"AAB33HA3EMN/AAB\",\"status\":\"DRAFT\",\"createdAt\":\"2026-03-20T10:32:18.000Z\",\"updatedAt\":\"2026-03-20T10:32:18.000Z\",\"partner\":{\"id\":11,\"denumire\":\"AND COMPUTER SRL\",\"adresa\":\" \\tStr. Libertatii 211 Bl. L9 Et. P Cod 140017 \",\"cui\":\"8658444\",\"reg_com\":\"J34/347/1996\",\"tara\":\"Romania\",\"judet\":\"Teleorman\",\"localitate\":\"Alexandria\",\"telefon\":\"0247-317.623\",\"email\":\"office@andcomputer.ro\",\"contact\":\"office\",\"createdAt\":\"2026-03-16T16:30:18.000Z\",\"updatedAt\":\"2026-03-16T16:30:18.000Z\"}}','Revizia 0','2026-03-20 10:33:25','2026-03-20 10:33:25',1,56),(44,'DTAT20260001',59,'{\"nr_inreg\":\"DTAT20260001\",\"observatii\":\"Contract dezapezire\",\"user_id\":59,\"partener_id\":13,\"obiectul\":\"Contract dezapezire 2026\",\"cod_ssi\":\"DSFDSFDS\",\"cod_angajament\":\"DASDDSA\",\"status\":\"DRAFT\",\"createdAt\":\"2026-03-23T16:42:44.000Z\",\"updatedAt\":\"2026-03-23T16:42:44.000Z\",\"partner\":{\"id\":13,\"denumire\":\"SC Teldrum SA\",\"adresa\":\"STR. LIBERTATII-PRELUNGIRE 458 BIS\",\"cui\":\"2695680\",\"reg_com\":\"J34/211/1998\",\"tara\":\"Romania\",\"judet\":\"Teleorman\",\"localitate\":\"Alexandria\",\"telefon\":\"0247-316.900 \",\"email\":\"office@teldrum.ro\",\"contact\":\"\\thttps://teldrum.ro\",\"createdAt\":\"2026-03-23T16:41:32.000Z\",\"updatedAt\":\"2026-03-23T16:41:32.000Z\"}}','Prima revizie','2026-03-23 16:43:39','2026-03-23 16:43:39',1,57);
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
INSERT INTO `id_counters` VALUES ('DE',2026,16,'2026-03-19 09:47:54','2026-03-26 08:29:37'),('DTAT',2026,1,'2026-03-23 16:42:44','2026-03-23 16:42:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partner`
--

LOCK TABLES `partner` WRITE;
/*!40000 ALTER TABLE `partner` DISABLE KEYS */;
INSERT INTO `partner` VALUES (1,'SC WISE ALTERNATIVE SRL','Str. Londra 20A Et. 1 Ap. 9 Cod 011763 ','37449905','J2022019203409','Romania','Sector 1','Bucuresti',NULL,NULL,NULL,'2026-02-23 16:39:02','2026-03-16 15:45:26'),(2,'SC AVA MOKANU SRL',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-02-23 16:39:02',NULL),(3,'RNP ROMSILVA - DS TR OCOLUL SILVIC ALEXANDRIA','sos. Turnu Magurele, nr. 1',NULL,NULL,'Romania','Teleorman','Alexandria','0247 312 238',NULL,NULL,'2026-02-23 16:39:02','2026-03-16 15:58:11'),(4,'MUZEUL JUDETEAN TELEORMAN','str. 1848, nr. 1','6491810',NULL,'Romania','Teleorman','Alexandria','0247 31 47 61','muzjudteleorman@yahoo.com',NULL,'2026-02-23 16:39:02','2026-03-16 15:34:15'),(5,'SPITAL PSIHIATRIE POROSCHIA','str. Dunarii, nr. 245','4568438',NULL,'Romania','Teleorman','Poroschia','0247318877','sp_poro_inc@yahoo.com',NULL,'2026-02-23 16:39:02','2026-03-16 15:22:57'),(6,'SJU ALEXANDRIA','str. Libertatii, nr. 1','4253650',NULL,'Romania','Teleorman','Alexandria','0247306711','secretariat@spitalulalexandria.ro',NULL,'2026-02-23 16:39:02','2026-03-16 15:19:14'),(7,'CASA SOCIALA A CONSTRUCTORILOR','Str. Episcopul Timuș nr. 25, sect. 1','11054090',NULL,'Romania','Sector 1','Bucuresti','(021) 317 89 02','office@casoc.ro',NULL,'2026-02-23 16:39:02','2026-03-16 15:36:17'),(8,'INSPECTORATUL JUDETEAN DE CONSTRUCTII','str. Independentei, nr. 4 bis','4469116',NULL,'Romania','Teleorman','Alexandria','0247 311 414','teleorman@isc.gov.ro',NULL,'2026-02-23 16:39:02','2026-03-16 15:29:46'),(9,'SC MINDSOFT IT SOLUTIONS SRL ','Piata Unirii, nr. 4','43164376 ','J2020001342323','Romania','Sibiu','Sibiu','+40 770 372 976','contact@mindsoft.ro','contact','2026-03-16 16:05:48','2026-03-16 16:05:48'),(10,'IT PLUS SRL ','Str. Dunarii 212 Bl. PATRIA Sc. C Et. 9 Ap. 126 Cod 140040','23919799','J34/411/2008','Romania','Teleorman','Alexandria','0347-809.123','itplus@gmail.com','Decebal Traian','2026-03-16 16:19:34','2026-03-16 16:19:34'),(11,'AND COMPUTER SRL',' 	Str. Libertatii 211 Bl. L9 Et. P Cod 140017 ','8658444','J34/347/1996','Romania','Teleorman','Alexandria','0247-317.623','office@andcomputer.ro','office','2026-03-16 16:30:18','2026-03-16 16:30:18'),(12,'EUROCAR SERVICE','Strada București, Nr. 187','RO7213707',' J1994000802344','Romania','Teleorman','Alexandria','0247.317.095','eurocaralex@eurocartr.ro','POPESCU','2026-03-19 13:44:45','2026-03-19 13:44:45'),(13,'SC Teldrum SA','STR. LIBERTATII-PRELUNGIRE 458 BIS','2695680','J34/211/1998','Romania','Teleorman','Alexandria','0247-316.900 ','office@teldrum.ro','	https://teldrum.ro','2026-03-23 16:41:32','2026-03-23 16:41:32');
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
INSERT INTO `registers` VALUES ('DE20260001','contract servicii mentenanta',52,9,'Contract mentenanta nr. 64/2025','02A800130203030','AAB33HA3EMN/AAB','2026-03-19 09:47:54','2026-03-19 09:47:54','ACTIVE'),('DE20260007','Reparatii masina Duster',52,12,'Contract reparatie Duster','02A800130203030','AAB33HA3EMN/AAB','2026-03-19 14:19:33','2026-03-19 15:44:24','ACTIVE'),('DE20260008','Contract achizitie rechizite',57,11,'Contract achizitie rechizite anul 2026','02A800130203030','AAB33HA3EMN/AAB','2026-03-20 09:42:49','2026-03-20 09:43:54','ACTIVE'),('DE20260009','Contract achizitie PC-uri',57,11,'Contract achizitie PC-uri','02A800130203030','AAB33HA3EMN/AAB','2026-03-20 10:32:18','2026-03-20 10:33:25','ACTIVE'),('DE20260010','Contract servicii mentenanta software',57,10,'Contract servicii mentananta software','02A800130203030','DSFDSFDSFSDFDSFDSFDSF','2026-03-24 11:28:07','2026-03-24 11:28:07','DRAFT'),('DE20260014','Achizitie piese auto Dacia',57,12,'Contract achizitie piese auto','02A800130203030','DSFDSFDSFSDFDSFDSFDSF','2026-03-24 11:58:45','2026-03-24 11:58:45','DRAFT'),('DE20260016','dsdsa',57,11,'dsadsadsa','DSFDSFDS','ssadsad','2026-03-26 08:29:37','2026-03-26 08:29:37','DRAFT'),('DTAT20260001','Contract dezapezire',59,13,'Contract dezapezire 2026','DSFDSFDS','DASDDSA','2026-03-23 16:42:44','2026-03-23 16:43:40','ACTIVE');
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
INSERT INTO `user_membership` VALUES (52,19,'2026-03-10',NULL,'2026-03-10 08:02:00','2026-03-10 08:02:00'),(53,19,'2026-03-10',NULL,'2026-03-10 08:06:02','2026-03-10 08:06:02'),(54,15,'2026-03-10',NULL,'2026-03-10 08:07:36','2026-03-10 08:07:36'),(55,11,'2026-03-16',NULL,'2026-03-16 07:15:23','2026-03-16 07:41:21'),(56,19,'2026-03-16',NULL,'2026-03-16 08:01:29','2026-03-16 08:01:29'),(57,16,'2026-03-23',NULL,'2026-03-23 15:35:26','2026-03-23 15:36:01'),(57,17,'2026-03-16',NULL,'2026-03-16 08:05:25','2026-03-16 08:05:25'),(59,34,'2026-03-23',NULL,'2026-03-23 16:07:04','2026-03-23 16:37:04'),(60,31,'2026-03-23',NULL,'2026-03-23 16:12:14','2026-03-23 16:24:09'),(61,31,'2026-03-23',NULL,'2026-03-23 16:23:25','2026-03-23 16:23:25');
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
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpire` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`username`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (52,'george.condeescu','george.condeescu@gmail.com','$2b$10$Bk4L8aT2PFxE3nfGeQFwwuQcevH.FmChlJlIAydaljLDLE9rMOv1q',1,'2026-03-10 08:02:00','2026-03-23 15:00:00',1,'George Condeescu',NULL,NULL),(53,'florin.giurcanas','f_giurcanas@yahoo.com','$2b$10$dE5XU49UiJiqfhrWlgQy0eYOLvaXaLHR3J6qabGdlAiezMzq.PpTK',0,'2026-03-10 08:06:02','2026-03-10 08:06:02',1,'Florin Giurcanas',NULL,NULL),(54,'petre.cernat','petre.cernat@gmail.com','$2b$10$xxiFxsb.fVG2Hb52FAdXjOXE.YsqA8ZyhelcqObRuUVbRJ4j2J5Au',0,'2026-03-10 08:07:36','2026-03-10 08:07:36',1,'Petre Cernat',NULL,NULL),(55,'dicu.marius','dicu.marius@yahoo.com','$2b$10$3L51pjyLswajciEXTzRDheQ.7yUabbWIRhAdwZEaN.1sc59IQiW8C',0,'2026-03-16 07:15:23','2026-03-16 07:41:21',1,'Dicu Marius',NULL,NULL),(56,'florin.burcea','florin.burcea@gmail.com','$2b$10$SZnIs6WNIh223mh3P2IQe.7zYuW.QJnlwSbJF.JJ/2tf00DiUI3Qq',0,'2026-03-16 08:01:29','2026-03-16 08:01:29',1,'Florin Burcea',NULL,NULL),(57,'marius.coman','marius.coman@gmail.com','$2b$10$d47biNsmMW1Y3jWLvecLwePaxbnmsL4O1S8EQ8LYWKVzzIK2k1GZG',0,'2026-03-16 08:05:25','2026-03-23 15:36:01',1,'Marius Coman',NULL,NULL),(59,'claudia.pana','claudia.pana@gmail.com','$2b$10$Kpp0AJNYalNQI99NvA0F7.i29vsz5dyexW1F2ii6J4.ykrgewA0EC',0,'2026-03-23 16:07:04','2026-03-23 16:37:04',1,'Claudia Pană',NULL,NULL),(60,'elena.sfintes','elena_sfintes@yahoo.com','$2b$10$LHg2hhqTZAgJHbpOCQl7nOqZQ6CP2rXq9FPHi8ej2yPq3ga.Um3P.',0,'2026-03-23 16:12:14','2026-03-23 16:24:09',0,'Elena Sfinteș',NULL,NULL),(61,'gabriela.radu','gabriela.radu@gmail.com','$2b$10$evwTyQzfWwFV5j0U0jWM8eAt64YrgvNIJMolx2DXp73scMpJPf8ii',0,'2026-03-23 16:23:25','2026-03-23 16:23:25',0,'Gabriela Radu',NULL,NULL);
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

-- Dump completed on 2026-03-26 10:56:27
