import Sequelize from 'sequelize';
// import sequelize from "../config/db.js";

import User from './user.js';
import UserMembership from './usermembership.js';
import OrgUnit from './orgunit.js';
import Partner from './partner.js';
import Registru from './registru.js';
import Nrinreg from './nrinreg.js';
import Circulatie from './circulatie.js';
import Document from './document.js';
import Comentariu from './comentariu.js';
import Fisier from './fisier.js';

// ✅ RELAȚIILE AICI
/** 1) User -> Memberships */
User.hasMany(UserMembership, {
  foreignKey: 'user_id',
  as: 'memberships',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

UserMembership.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

/** 2) OrgUnit -> Memberships */
OrgUnit.hasMany(UserMembership, {
  foreignKey: 'org_unit_id',
  as: 'memberships',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

UserMembership.belongsTo(OrgUnit, {
  foreignKey: 'org_unit_id',
  as: 'orgUnit',
});

/** 3) Partner -> Registru */
Partner.hasMany(Registru, {
  foreignKey: 'partener_id',
  as: 'registru',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Registru.belongsTo(Partner, {
  foreignKey: 'partener_id',
  as: 'partner',
});

/** 4) Registru -> Document */
Registru.hasMany(Document, {
  foreignKey: 'nr_inreg',
  sourceKey: 'nr_inreg',
  as: 'documents',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Document.belongsTo(Registru, {
  foreignKey: 'nr_inreg',
  targetKey: 'nr_inreg',
  as: 'registru',
});

/** 5) Document -> Comentariu */
Document.hasMany(Comentariu, {
  foreignKey: 'document_id',
  as: 'comentarii',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Comentariu.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document',
});

/** 6) Document -> Fisier */
Document.hasMany(Fisier, {
  foreignKey: 'document_id',
  as: 'fisiere',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Fisier.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document',
});

/**7 Users -> Documents**/
User.hasMany(Document, {
  foreignKey: 'created_by_user_id',
  as: 'created_documents',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Document.belongsTo(User, {
  foreignKey: 'created_by_user_id',
  as: 'creator',
});

User.hasMany(Document, {
  foreignKey: 'current_user_id',
  as: 'inbox_documents',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Document.belongsTo(User, {
  foreignKey: 'current_user_id',
  as: 'current_user',
});

/**8, Users -> Registru */
User.hasMany(Registru, {
  foreignKey: 'user_id',
  as: 'created_registries',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Registru.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'creator',
});

/**9, Circulatie -> Document */
Circulatie.belongsTo(Document, {
  foreignKey: 'document_id',
  as: 'document',
});

Document.hasMany(Circulatie, {
  foreignKey: 'document_id',
  as: 'circulatii',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

/**10, Circulatie -> User (from_user) */
Circulatie.belongsTo(User, {
  foreignKey: 'from_user_id',
  as: 'from_user',
});

User.hasMany(Circulatie, {
  foreignKey: 'from_user_id',
  as: 'sent_circulatii',
});

/**11, Circulatie -> User (to_user) */
Circulatie.belongsTo(User, {
  foreignKey: 'to_user_id',
  as: 'to_user',
});

User.hasMany(Circulatie, {
  foreignKey: 'to_user_id',
  as: 'received_circulatii',
});

export {
  User,
  UserMembership,
  OrgUnit,
  Partner,
  Registru,
  Nrinreg,
  Circulatie,
  Document,
  Comentariu,
  Fisier,
};
