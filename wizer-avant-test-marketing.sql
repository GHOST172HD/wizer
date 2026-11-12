PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  email_index TEXT NOT NULL UNIQUE,
  prenom_chiffre TEXT NOT NULL,
  nom_chiffre TEXT NOT NULL,
  telephone_chiffre TEXT NOT NULL,
  email_chiffre TEXT NOT NULL,
  mot_de_passe_sel TEXT NOT NULL,
  mot_de_passe_empreinte TEXT NOT NULL,
  mot_de_passe_iterations INTEGER NOT NULL DEFAULT 100000 CHECK(mot_de_passe_iterations BETWEEN 1 AND 1000000),
  qr_code TEXT NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK(total_points >= 0),
  cree_le INTEGER NOT NULL
);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('1ed537ed-8338-4c48-b005-5b1f67d05ae2','aababedfba8663411a95b55f65bb1c1e57dcff7346b2000e8b6d2288e0cbeca0','A05SHq4ueQa90VhE.lL/iMnZHrAQn/bU8QVGsQ60kRJVB4qvL5+EyTg==','pKlrQfLrBnqaxi7I.zxKtZZSig4ab2hyXG1hCCiB7hJY=','PGG9+GInZ3PjO158.gUrH3PwLWEhOHTmylzVCZc8fOcKPf7jpt5uYONs=','10fIhwwY6XLs+5bw.RqkY5MT1kiryS2dgKduD5ND0pl5DqNbW0IC84g7+cGMtWsKWbA==','586e3e1a25e497112a1a822ec93c0122','28c047cac629158c886afb83bcbfb20a2a19c002d40bc6ca1893a6274faf969a',100000,'aa0dbd7e88378d5c40998ae6a28199760e253c9a4537c3a40282b9d36a14e463',1,1793145500);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('b42e9bb3-5bd4-4108-88f0-307305eddf03','30286594a29822ae097519f3efb6f196cbc3ef6f0288c4aff27f125d859b25ec','Tb7848j4uFMZojcY.vmtVutaLShNDj+COZto9yZNIASc=','IZ38cL2O/Cvvj6QJ.0efBr71oLEl1HfJPwpcyzNhrwlKN5A==','U/iU4LLBHPrD40EE.7WDy6Pgid1V/ajBCsVD4Mf/jXg+xEDSHqNOOum0=','8TGjDqtQVzKnnmei.CqGFA5Ji8WV7iPWnyL2ZQajCSt6oTG+xEA7Rd/xb2mMKhf0D','44ff23fa095427f456adb8f1de591ab9','0ea9dc8b0cd863048723deec754cfc78ccb62d40a846f42c80fa0886c1bf8e6d',100000,'ef2c0ec03820f93980df10d2aa86717fd9b5e136ea565b4a383af6b112761db7',0,1793215261);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('334d4f4f-59ec-44ae-8b30-ecfed922b246','a3c4ff4cad1464cccf141c27df8cf8bfcd549f5e6b5955e515b350829ce9409c','ioLEL2l2wiHf5i84.EhNQSgLzT2YR3bxFdcwnTopEWPeW','n8yv774ATWIYILO8.fKWhhi9xjV6sEE7k5mNtvQXpM/I=','pARNhk8IGJYGUWdI.Zwfi9LRL7/N9Zn2XM2WqOaA1IWsbCEzEayOEr4U=','loyou1fzD2cC5vLD.1eCuystnvnQZm09tnTIjmeFV7BDtXZtlf/VtHKiRcqjlPmbwDp9k','3db77322ffac960482b76382c926046c','d1e87e2912f379c209df7be803f611db89e52fdfb1ae47824b77821b500c4162',100000,'814be0954167c4485ad02233621cafd08e3be8bd955b085a771c51b8983de4df',0,1793217604);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('09c4a520-3a8c-49cb-9f72-e2c5796b954c','9e5b0620e142150decc90e6f3ff842ac499601714bf65d478a2034ff0590eb0c','wio0qA8/URZXVxpH.ShYwui0Uqm2Ufe1CoWL+L9OvflVcLg==','wk964tEef8OQ8tLf.mIEd1j2zIUXwBTpAO1E7st2Y7UuxeQ==','1Fh4RMBLm6NMx5pZ.qyrH5PtHG1dxilglQVfOa5fsBhKMoBgdfO7utYA=','NlkBNN7YUV9HdVgp.ZVAPhmmtvS7XogOg00ocz2SEkFR+gH2J3vD4QInrPtKaTkg=','4a0032dd5c332d2e22baad7672c7db08','693aee47cefd242846b7ee393f704f42a18a572e687e1cef42ba1d96405014db',100000,'e8782de4baadeb0e840142e1e63275f7b1b640649240e6c1bbf3b5f911b1f0c0',0,1793230208);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('97a219b2-bc23-44fb-b4c6-7122974e5010','f19237c77a5ac7ae8091748d452f737cd25cb5e860a1e6d42ea26a89aa5917a1','zg1V3aqtKU4oWKKh.CRbSwUenkzUOqWK+fMk48rtr8qSZ1uw=','wqRRTPh4BYxgBK8S.d39Wig1tbsNcs1K/ImERAZ5O516/EQ==','2G9FwbJ+UhsrKdt4.zgMjOsP9RVgmOrvkcP2vGnEZnaIo4xxiASgeP6E=','GOItbiJX57Scw6i8.fuVIvbrs6ZsauiRYtH63xKKk2OFqSRDxsGUgbPSseBS1rQ==','b6127591bd9424a1cd497780db3053f5','a9ef9baebdefb9330f917d6aed2676efc19052f7696d39f1667d9054739e5d53',100000,'568c2f43b04bc55bb61bbef47934219ae1466fafd820024182772fe290218f5f',0,1793256164);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('1cbf6206-2ec3-4f0c-b538-9e7854f5fa8a','d1a13590793872796a1ed5e980915a914ddf1f434c52885c3f13d7fcc31b31af','iAX6aRNkfFtFi7me.pA+BfbFpIQh1oTtKz9B9zROCdGAfQy4=','Gl4gcxOtvLBJgh7w.mOuT+l4UoPetqdOKbLKCTVHBxxv1aQ==','X1FlTMR+l6G0f95Q.SLpPJbMbVbqPfrPfZUe60Qeb1vAOoLFh4DXYUg==','Sd+VCAWn7sYTWdAb.NATVnaxsC63JuZWA8MFnJ7D+dlJVouQmwUrzawEjx9vVdnZ8wBs=','90b05d1f5d49678e478afc0373eb6e11','114ffb867d513411372b8310d2c2498f107e503af8ef74ed07f461b806ba6faf',100000,'2a0eae8d5952478db88152e04fd249b7509449a7f8eeb713045e3706a9aeff2a',0,1793276886);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('a219a4c5-219b-45d3-b02a-81ab52b650fb','84aeebacfb447080b0277985fc06a3cdab5e80dbf5621d6b67716ebd5beee06f','53JhzCC8kDt7/3sm.m+aZ+z6VDOYl4vn2EcM7xtB7lKh+Zw==','WXXSmx0Zrw0q2sIs.vFJwPbfMJ/vatIxiC4eopcbxoTx8Kg==','spjvSQyX9f1EGB6v.aZLd0hS8pSMTzhUf7jSgL77Ezgv7W/FEUnoQyq8=','Z8bPZLEF+ExESMNY.PmtIdCFGjcuyGObRRggdev1c793GFxS5svthys6hA1oBHvtve9oI4Wc=','cf3a25e7ad4579af3eee3bae5394386d','dac27e2ae21027cc15cb421f5159c38b57fa8a925454f8a8f0ccce28c32f9631',100000,'9e0ef36ab76f777da2f55c41f559af7e5390c4023989271c28819a99407fccc3',0,1793286293);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('eed92657-bebd-4074-97fb-3bb7f8d84f09','60a83f72f6bda7c9d51525bb0a4a39c23fb2d4082429467b379eda4a3cf83649','EUYVL6ypPiDqE7we.15QO3YUNfdherIvhXARfQU/C2Lv58w==','hVASvmTxieCitqwZ.fmwm9Z0cRHtdAonAQ9zmkSwyqiQGEQ==','3SsYuvIPTmpENa5z.QYLxPT6bW0hX3E9g6VpcZUlEbCwAezldR/t8JYY=','RlWpNgeRLaGljI31.mwPIuBxiLYKldG2SxJvo5v5v5ym52dW1cAi61HCaHl6U','dcec622b239167d9d6a07a3eebdbc3b7','42c168e913c01cc3d4f594857b001400b6672a933fbb5a85609cbfe7c1543412',100000,'c5e1faa314a0a1dc8c51598623c92b0c5409dd375ffa59d563ac3c8eba333f94',0,1793288122);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('4a494677-f25f-4620-9d62-f18c36055a01','7f79e03ad3cdb07acfeedd0828759e312ab2d4fb7c561273c35e8adea41d3020','FrPxZkynycXrqlEo.f2ipdG7iy5OnYEr0nac1/aHHDkL052G8','muvH+2waMy3EFxnM.9XF1rH8HECA8AphAGzbLzl/KVZ67F+p72+G8','Me1guEF1pxaqG5Mk.Z1f34y4fS4Zc1du+ZA4cINg3R3P5f5IgJu45DIc=','M/dJ7rOLAo+MjfV7.yJuIshNl/4aPAW9MqFyfLP6PHm5Xz4yB9ih9mYFvgvFYITI=','66337d4badb26e49850885d11ea5d573','4da5b038fa1b8f1aa08d5a3f093531a368ec96801a3072b9af4e472d5d615c5e',100000,'43cfa390979a0a9ddce6fb1aa61dc434b6bd2869a7c53c60a1b878a6c29be9c4',1,1793295530);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('762215d7-1c9c-4a46-bcb6-23961d4dd705','d4d62ec77a69698778457c25666f53d3573602ee56df69b33f7d30564825d43a','vUiSPfHgdaxFiuWH.wBwKckbGgGI4ZehQ12JtWDIxao8NFFNd','o+I4PdHETHRt5sMS.G2ca4wT7mQlYtUFMk1hTG3kk3jbI0vcJBg==','uoA0wUFf9IpcrqT1.+4853JFx3ysPr4eQYzgVVQY3oN32bVkXKn11Hbc=','fZLXkh/SRPcb4Yfv.gUIkooraD6wmp/qgGDUVBkRA4lrRnij/sIcPRiGwGuGI9W7wgMmzbzYbp73M','3d560a904ebab7680c02797d3b31d038','30b978f07b80a26eb1708addae29ab91cc2f4a66005fc30925dcd83efa56c367',100000,'0d3665145543728d69b2acccfbfa35418443ca5beaee0121024b3d156b773911',0,1793318311);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('27aca2b6-4156-48da-b2c3-de7bd76db9a2','4427f4d3d18bf0a26e0a5f01163842c0b0b68ad23f703a9113bfd50c511a1643','pH+9IkRB7OBW8X4x.DPv5nFHCnIY6jz9KqFlRcpyH1wYrqeBxGpta5w==','jMxUoQGbiIWxPCe+.HlLTPfYDLEu46hQ1cO11b6OuV0s=','Vo2/qSrQBEz4VHOb.LbVt0FdoKazVyc9PGyoSw44pBRrWh3lIN7wbwDg=','8cI7D4ambTisw0jv.D+I/ySRma0MLqugX3oWnryBqg2Amp3oB9CfHfsc1N8VJgLuWu01ac4YSWmI=','2dcb53dae511ce8a5e9afaccb05d5c92','6c948c52cbb0b8bc394359b53c3faf3cf732103c4ab7ae2af484bd73848d0c56',100000,'95e9f2de68204df21a8b26bf666284b7affa681db7cc49ae6c1cf925d3ee7861',1,1793458268);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('ad00e231-a0af-4aa2-9747-1ed5eda7f4bd','6e88b573634058ae7e3a5056a596a0ae6778db66b5863c26b2a5a9f5a9c41906','NltGbdJT5OM3T0Cq.x++rWd0tNKf4KQXQjRHf2A6k9lZIqiv1','9Y5UW8kWan5r45+I.OXz6Xdg+HjDsZb//ge0EZjnuEw==','Ey3MdwvFhqHWNKLq.KqctjajROL9wzySYuhy1zU9m/3hHAplmHsQkHIc=','7Ne3TKkW1nY8EJRF.vgAntiQyz+zjS3MZPvU2T8SMai0mW/XLHtlee6aaS56txg==','9511c83b53213acecf58a553d586bd00','2b50e1dc82c0fd68c457b61682c4e703c21cf808cf813bbf04078653c0447c03',100000,'57a4660cecb634a23df6ec692b97413f4ab7af95ca9acf34a41b4ec70c4f7b78',0,1794004430);
INSERT INTO "clients" ("id","email_index","prenom_chiffre","nom_chiffre","telephone_chiffre","email_chiffre","mot_de_passe_sel","mot_de_passe_empreinte","mot_de_passe_iterations","qr_code","total_points","cree_le") VALUES('b953c2ce-91f4-4d0f-b5e9-e28cf1ce7ea8','b1c1dc0eac6de912d25f401ff55ba1eb11bce9be4a62d855104a3f391537eb05','IKtmEKs2JG8PAZm4.t7C8/mqW8FR/oaw8kTJDXAem06U9','GpaDaasm/o7gPiaV.PaHwvmMClfA4xRPkqxQOLeV3TMU0','0ve8ZfjjlpPt/ULz.0hUxdK/seN6YHySrk/MZm1Q28Ntlx0QCXgDO3jg=','tGxEXbGxe7GNDbP5.rw1yuSRYN9e9j3d3N6hSE++/EcMxHRvHMFHXJDR0yvbWoTzo3s1x','6c4c4dc2889d6ecc0427dfc8800cbc27','255ef2a92465ca683a7ceb41b76a812be0afdd937dc52cdab7278159c54375de',100000,'47aefb6bf27dbcda2fe867979a4af10f0349c832a8d396fd07c64f4edab4c262',0,1794420913);
CREATE TABLE sessions (
  identifiant_hash TEXT PRIMARY KEY,
  type_session TEXT NOT NULL CHECK(type_session IN ('client','agent')),
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  expire_le INTEGER NOT NULL
);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('5fd25607065bc72eb5da4201d06d3bd719a87557d672fa11385763d9073381e9','client','b42e9bb3-5bd4-4108-88f0-307305eddf03',1795807261);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('0aed27e9b2d06c31785e41302775dac9559b20d2bcbc47c7fe1b2eff24206680','client','334d4f4f-59ec-44ae-8b30-ecfed922b246',1795809604);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('875a04edfb89893217bc99bf5c5690c2ccaa21f07763fa213255cc573103a664','client','09c4a520-3a8c-49cb-9f72-e2c5796b954c',1795822208);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('0b2f1c359beecd5a6c5dd095c465b6b738445d29ed2931f08d39d59566f27ea2','client','97a219b2-bc23-44fb-b4c6-7122974e5010',1795848164);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('d4489e7c2bd6a379da4032cf60914117452f26752a9c4b52d1d433e22bbe8937','client','1cbf6206-2ec3-4f0c-b538-9e7854f5fa8a',1795868886);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('0f8c6796ce08190c7e3f3bfdebe8f92aac78e9ae642563d93c6758b2bfa78a93','client','a219a4c5-219b-45d3-b02a-81ab52b650fb',1795878293);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('976277f3514be4afa82ac26a6c5c58341f967cc0a5f21299f8e1a0ddebc94b28','client','eed92657-bebd-4074-97fb-3bb7f8d84f09',1795880122);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('dc9d203c189fc818f060b9479c41192bf8052ac9246e217c47e7934b3eb6d445','client','4a494677-f25f-4620-9d62-f18c36055a01',1795887530);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('f04d004fd6bbbc05d3306c433cfc8cd4764369cd182660e9c8c47cb5ba5b8a61','client','762215d7-1c9c-4a46-bcb6-23961d4dd705',1795910312);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('e4cdf22eab81495b1ce3a7015a55b4401b6f3b1f4d506cbc3fd1ac847f380434','client','4a494677-f25f-4620-9d62-f18c36055a01',1796571520);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('87841bdc96a69118f745f8c7ff9f5e3061e8eba59314d04785314d797531296f','client','ad00e231-a0af-4aa2-9747-1ed5eda7f4bd',1796596430);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('ebf966a64578f52242d3c566d23ce8edddc4dcc32ed5d1f8ef655a451efe534e','client','b953c2ce-91f4-4d0f-b5e9-e28cf1ce7ea8',1797012913);
INSERT INTO "sessions" ("identifiant_hash","type_session","client_id","expire_le") VALUES('4f9fd8ee903cf441be4163f26b806227471bbfe6624ee001a835d1726d5e9256','agent',NULL,1794520718);
CREATE TABLE mouvements_points (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type_mouvement TEXT NOT NULL CHECK(type_mouvement IN ('gain','utilisation','ajustement')),
  quantite INTEGER NOT NULL CHECK(quantite != 0),
  cree_le INTEGER NOT NULL,
  operation_id TEXT NOT NULL UNIQUE
);
INSERT INTO "mouvements_points" ("id","client_id","type_mouvement","quantite","cree_le","operation_id") VALUES('71a1254d-0e81-44db-b743-7658bb50f54b','1ed537ed-8338-4c48-b005-5b1f67d05ae2','gain',1,1793146010,'9a6907be-a5c0-4801-8750-58941e4f5d10');
INSERT INTO "mouvements_points" ("id","client_id","type_mouvement","quantite","cree_le","operation_id") VALUES('5f3ef1fa-228e-4d62-ad7b-42522de79283','27aca2b6-4156-48da-b2c3-de7bd76db9a2','gain',1,1794001776,'c7fd1936-6c9b-47e3-9d0d-5621b2b78fd4');
INSERT INTO "mouvements_points" ("id","client_id","type_mouvement","quantite","cree_le","operation_id") VALUES('402e54ad-7478-40ca-8bcc-095dd8379d36','4a494677-f25f-4620-9d62-f18c36055a01','gain',1,1794001821,'1a89a904-bc5f-4a21-a5d5-287f62efe057');
CREATE TABLE recompenses (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  points_requis INTEGER CHECK(points_requis IS NULL OR points_requis > 0),
  active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1))
);
INSERT INTO "recompenses" ("id","titre","description","points_requis","active") VALUES('soin-offert','Soin découverte offert','Une prestation découverte selon les disponibilités.',NULL,0);
INSERT INTO "recompenses" ("id","titre","description","points_requis","active") VALUES('reduction','Réduction fidélité','Remise sur une future prestation, montant à décider.',NULL,0);
INSERT INTO "recompenses" ("id","titre","description","points_requis","active") VALUES('upgrade','Surclassement de prestation','Un supplément de soin offert avec une prestation.',NULL,0);
CREATE TABLE utilisations_recompenses (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  recompense_id TEXT NOT NULL REFERENCES recompenses(id),
  mouvement_id TEXT REFERENCES mouvements_points(id),
  cree_le INTEGER NOT NULL
);
CREATE TABLE reinitialisations (
  jeton_hash TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  expire_le INTEGER NOT NULL,
  utilise_le INTEGER
);
CREATE TABLE tentatives_connexion (
  cle_hash TEXT PRIMARY KEY,
  nombre INTEGER NOT NULL,
  debut_fenetre INTEGER NOT NULL
);
CREATE TABLE marketing_preferences (
 client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
 subscribed INTEGER NOT NULL DEFAULT 0 CHECK(subscribed IN (0,1)),
 subscribed_at INTEGER,
 unsubscribed_at INTEGER,
 source TEXT NOT NULL DEFAULT 'compte'
);
INSERT INTO "marketing_preferences" ("client_id","subscribed","subscribed_at","unsubscribed_at","source") VALUES('b953c2ce-91f4-4d0f-b5e9-e28cf1ce7ea8',1,1794420913,NULL,'inscription');
CREATE TABLE marketing_campaigns (
 id TEXT PRIMARY KEY,
 subject TEXT NOT NULL,
 message TEXT NOT NULL,
 button_label TEXT NOT NULL,
 button_url TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','completed')),
 created_at INTEGER NOT NULL
);
CREATE TABLE marketing_deliveries (
 campaign_id TEXT NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
 client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent','skipped','failed')),
 attempts INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL,
 retry_at INTEGER NOT NULL DEFAULT 0,
 last_error TEXT,
 PRIMARY KEY (campaign_id, client_id)
);
CREATE INDEX idx_sessions_expiration ON sessions(expire_le);
CREATE INDEX idx_points_client_date ON mouvements_points(client_id, cree_le DESC);
CREATE INDEX idx_marketing_consent ON marketing_preferences(subscribed);
CREATE INDEX idx_marketing_pending ON marketing_deliveries(state,retry_at);
