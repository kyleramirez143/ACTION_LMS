'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// =========================
// CONSTANTS: IDs from initial-data seeder
// =========================
const ADMIN_ROLE_ID = 'a0000000-0000-0000-0000-000000000001';
const TRAINER_ROLE_ID = 'a0000000-0000-0000-0000-000000000002';
const TRAINEE_ROLE_ID = 'a0000000-0000-0000-0000-000000000003';

// =========================
// CONSTANTS: Batch 40
// =========================
const BATCH_40_ID = 'd0000000-0000-0000-0000-000000000001';
const CURRICULUM_ID = 'e0000000-0000-0000-0000-000000000001';
const QUARTER_IDS = [
  'f0000000-0000-0000-0000-000000000001', // Q1
  'f0000000-0000-0000-0000-000000000002', // Q2
  'f0000000-0000-0000-0000-000000000003', // Q3
  'f0000000-0000-0000-0000-000000000004', // Q4
];

// =========================
// DEFAULT PASSWORD FOR ALL BATCH 40 USERS
// =========================
const DEFAULT_PASSWORD = 'acTionb402025!';

// =========================
// TODO: FILL IN ACTUAL ADMIN DATA
// =========================
const ADMINS = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    first_name: 'Ryan Nino',
    last_name: 'Rodriguez',
    email: 'ryannino.rodriguez_ad@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Cebu',
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    first_name: 'Mary Ann',
    last_name: 'Mateo',
    email: 'maryann.mateo_ad@awsys-i.com', 
    password: DEFAULT_PASSWORD,
    location: 'Manila',
  },
];

// =========================
// TODO: FILL IN ACTUAL TRAINER DATA
// =========================
const TRAINERS = [
  {
    id: 'c2000000-0000-0000-0000-000000000001',
    first_name: 'Mary Ann',
    last_name: 'Mateo',
    email: 'maryann.mateo_tr@awsys-i.com', 
    password: DEFAULT_PASSWORD,
    location: 'Manila',
  },
  {
    id: 'c2000000-0000-0000-0000-000000000002',
    first_name: 'Rie',
    last_name: 'Hayashi',
    email: 'rie.hayashi@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
  },
  {
    id: 'c2000000-0000-0000-0000-000000000003',
    first_name: 'Mika',
    last_name: 'Tsuboi',
    email: 'mika.tsuboi@awsys-i.com', 
    password: DEFAULT_PASSWORD,
    location: 'Manila',
  },
  {
    id: 'c2000000-0000-0000-0000-000000000004',
    first_name: 'Asami',
    last_name: 'Sugawara',
    email: 'asami.sugawara@awsys-i.com', 
    password: DEFAULT_PASSWORD,
    location: 'Manila',
  },
  {
    id: 'c2000000-0000-0000-0000-000000000005',
    first_name: 'Haruka',
    last_name: 'Konno',
    email: 'haruka.konno@awsys-i.com',// CHANGE THIS
    password: DEFAULT_PASSWORD,
    location: 'Manila',
  },
];

// =========================
// TODO: FILL IN ACTUAL TRAINEE DATA (12 trainees)
// =========================
const TRAINEES = [
  {
    id: 'c3000000-0000-0000-0000-000000000001',
    first_name: 'Xeix Mikhael',
    last_name: 'Alday',
    email: 'xeix.alday@awsys-i.com', 
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    // Onboarding checkpoint data
    onboarding: {
      bpi_account_no: '1599789258',
      sss_no: '0451560694',
      tin_no: '680439941',
      pagibig_no: '121371846132',
      philhealth_no: '092503543607',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true, 
      passport_ok: true, 
      imf_awareness_ok: true, 
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000002',
    first_name: 'Cassandra Alyanna',
    last_name: 'Co',
    email: 'cassandra.co@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789568',
      sss_no: '3538551594',
      tin_no: '681163009',
      pagibig_no: '121368899097',
      philhealth_no: '012524980868',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true, 
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000003',
    first_name: 'Cherlize Janelle',
    last_name: 'Cuevas',
    email: 'cherlize.cuevas@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789541',
      sss_no: '0451475608',
      tin_no: '680510768',
      pagibig_no: '121368595276',
      philhealth_no: '082517228385',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true, 
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000004',
    first_name: 'Manuel John',
    last_name: 'Dalacan',
    email: 'manuel.dalacan@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789436',
      sss_no: '3508028235',
      tin_no: '680711784',
      pagibig_no: '121369086777',
      philhealth_no: '010270460882',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000005',
    first_name: 'Loysce Roiele',
    last_name: 'Fajardo',
    email: 'loysce.fajardo@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789266',
      sss_no: '3538586886',
      tin_no: '687101162',
      pagibig_no: '121365162322',
      philhealth_no: '082505878619',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000006',
    first_name: 'Lloyd Adrian',
    last_name: 'Lindo',
    email: 'lloyd.lindo@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789452',
      sss_no: '3538547485',
      tin_no: '683452307',
      pagibig_no: '121368939204',
      philhealth_no: '032521813015',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000007',
    first_name: 'Christine',
    last_name: 'Marasigan',
    email: 'christine.marasigan@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789673',
      sss_no: '0450074301',
      tin_no: '681455762',
      pagibig_no: '121357312257',
      philhealth_no: '082532085817',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000008',
    first_name: 'Lady Denise',
    last_name: 'Mendoza',
    email: 'lady.mendoza@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789576',
      sss_no: '3538547430',
      tin_no: null,
      pagibig_no: '121368861566',
      philhealth_no: '020278700748',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000009',
    first_name: 'Cedric John',
    last_name: 'Nedtran',
    email: 'cedric.nedtran@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789231',
      sss_no: '3539366995',
      tin_no: '682-628-368',
      pagibig_no: '121368100442',
      philhealth_no: '082506380738',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000010',
    first_name: 'Carlo James',
    last_name: 'Polancos',
    email: 'carlo.polancos@awsys-i.com', // CHANGE THIS
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789444',
      sss_no: '3538008827',
      tin_no: '680511238',
      pagibig_no: '121368731044',
      philhealth_no: '082516894624',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000011',
    first_name: 'Kyle Angel',
    last_name: 'Ramirez',
    email: 'kyle.ramirez@awsys-i.com',
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789584',
      sss_no: '3520629751',
      tin_no: '656311067',
      pagibig_no: '121300896485',
      philhealth_no: '030270984106',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
  {
    id: 'c3000000-0000-0000-0000-000000000012',
    first_name: 'Mark Christian',
    last_name: 'Sayson',
    email: 'mark.sayson@awsys-i.com', // CHANGE THIS
    password: DEFAULT_PASSWORD,
    location: 'Manila',
    onboarding: {
      bpi_account_no: '1599789223',
      sss_no: '3539163635',
      tin_no: '682177623',
      pagibig_no: '121370034875',
      philhealth_no: '012507222070',
      uaf_ims: true,
      office_pc_telework: true, 
      personal_pc_telework: true,
      passport_ok: true, 
      imf_awareness_ok: true,
    }
  },
];

// =========================
// SEEDER
// =========================
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // --- BATCH 40 ---
    await queryInterface.bulkInsert('batches', [
      {
        batch_id: BATCH_40_ID,
        name: 'Batch 40',
        location: 'Manila',
        start_date: '2025-07-21',
        end_date: '2025-12-12',
        created_at: now,
        updated_at: now,
      }
    ]);

    // --- CURRICULUM ---
    await queryInterface.bulkInsert('curriculums', [
      {
        curriculum_id: CURRICULUM_ID,
        batch_id: BATCH_40_ID,
        start_date: '2025-07-21',
        end_date: '2025-12-12',
        created_at: now,
        updated_at: now,
      }
    ]);

    // --- QUARTERS ---
    await queryInterface.bulkInsert('quarters', [
      {
        quarter_id: QUARTER_IDS[0],
        curriculum_id: CURRICULUM_ID,
        name: 'Q1',
        start_date: '2025-07-21',
        end_date: '2025-08-29',
        created_at: now,
        updated_at: now,
      },
      {
        quarter_id: QUARTER_IDS[1],
        curriculum_id: CURRICULUM_ID,
        name: 'Q2',
        start_date: '2025-09-01',
        end_date: '2025-10-03',
        created_at: now,
        updated_at: now,
      },
      {
        quarter_id: QUARTER_IDS[2],
        curriculum_id: CURRICULUM_ID,
        name: 'Q3',
        start_date: '2025-10-06',
        end_date: '2025-11-07',
        created_at: now,
        updated_at: now,
      },
      {
        quarter_id: QUARTER_IDS[3],
        curriculum_id: CURRICULUM_ID,
        name: 'Q4',
        start_date: '2025-11-10',
        end_date: '2025-12-12',
        created_at: now,
        updated_at: now,
      },
    ]);

    // --- INSERT USERS ---
    const allUsers = [...ADMINS, ...TRAINERS, ...TRAINEES].map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_active: true,
      location: user.location,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('users', allUsers);

    // --- PASSWORDS ---
    const passwordRecords = [];
    for (const user of [...ADMINS, ...TRAINERS, ...TRAINEES]) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      passwordRecords.push({
        id: uuidv4(),
        password: hashedPassword,
        user_id: user.id,
        is_current: true,
        created_at: now,
      });
    }

    await queryInterface.bulkInsert('passwords', passwordRecords);

    // --- USER ROLES ---
    const userRoles = [];
    
    // Admins
    ADMINS.forEach(admin => {
      userRoles.push({
        user_id: admin.id,
        role_id: ADMIN_ROLE_ID,
        created_at: now,
      });
    });

    // Trainers
    TRAINERS.forEach(trainer => {
      userRoles.push({
        user_id: trainer.id,
        role_id: TRAINER_ROLE_ID,
        created_at: now,
      });
    });

    // Trainees
    TRAINEES.forEach(trainee => {
      userRoles.push({
        user_id: trainee.id,
        role_id: TRAINEE_ROLE_ID,
        created_at: now,
      });
    });

    await queryInterface.bulkInsert('user_roles', userRoles);

    // --- USER BATCHES (Assign all users to Batch 40) ---
    const userBatches = [];
    [...TRAINEES].forEach(user => {
      userBatches.push({
        user_id: user.id,
        batch_id: BATCH_40_ID,
        assigned_at: now,
      });
    });

    await queryInterface.bulkInsert('user_batches', userBatches);

    // --- ONBOARDING CHECKPOINTS (for trainees only) ---
    const onboardingCheckpoints = [];
    TRAINEES.forEach(trainee => {
      onboardingCheckpoints.push({
        id: uuidv4(),
        user_id: trainee.id,
        bpi_account_no: trainee.onboarding.bpi_account_no,
        sss_no: trainee.onboarding.sss_no,
        tin_no: trainee.onboarding.tin_no,
        pagibig_no: trainee.onboarding.pagibig_no,
        philhealth_no: trainee.onboarding.philhealth_no,
        uaf_ims: trainee.onboarding.uaf_ims,
        office_pc_telework: trainee.onboarding.office_pc_telework,
        personal_pc_telework: trainee.onboarding.personal_pc_telework,
        passport_ok: trainee.onboarding.passport_ok,
        imf_awareness_ok: trainee.onboarding.imf_awareness_ok,
        created_at: now,
        updated_at: now,
      });
    });

    await queryInterface.bulkInsert('onboarding_checkpoints', onboardingCheckpoints);
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order to respect foreign key constraints
    
    const allUserIds = [...ADMINS, ...TRAINERS, ...TRAINEES].map(u => u.id);
    const traineeIds = TRAINEES.map(t => t.id);

    // Delete onboarding checkpoints
    await queryInterface.bulkDelete('onboarding_checkpoints', {
      user_id: { [Op.in]: traineeIds }
    });

    // Delete user_batches
    await queryInterface.bulkDelete('user_batches', {
      batch_id: BATCH_40_ID
    });

    // Delete user_roles
    await queryInterface.bulkDelete('user_roles', {
      user_id: { [Op.in]: allUserIds }
    });

    // Delete passwords
    await queryInterface.bulkDelete('passwords', {
      user_id: { [Op.in]: allUserIds }
    });

    // Delete users
    await queryInterface.bulkDelete('users', {
      id: { [Op.in]: allUserIds }
    });

    // Delete quarters
    await queryInterface.bulkDelete('quarters', {
      curriculum_id: CURRICULUM_ID
    });

    // Delete curriculum
    await queryInterface.bulkDelete('curriculums', {
      batch_id: BATCH_40_ID
    });

    // Delete batch
    await queryInterface.bulkDelete('batches', {
      batch_id: BATCH_40_ID
    });
  }
};
