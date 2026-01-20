// ./src/config/navConfig.js

export const navLinks = [
  // ------------------ Admin ------------------
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    requiredRoles: ['Admin'],
  },
  {
    name: 'Course Management',
    path: '/admin/course-management',
    requiredRoles: ['Admin'],
  },
  {
    name: 'User Management',
    path: '/admin/user-management',
    requiredRoles: ['Admin'],
  },
  {
    name: 'Curriculum',
    requiredRoles: ['Admin'],
    children: [
      {
        name: 'View Batch Table',
        path: '/admin/batch-management',
      },
      {
        name: 'View Module Table',
        path: '/admin/module-management',
      },
      {
        name: 'Action Calendar',  // unified calendar link
        path: '/admin/calendar',
      },
    ],
  },

  // ------------------ Trainer ------------------
  {
    name: 'Dashboard',
    path: '/trainer/dashboard',
    requiredRoles: ['Trainer'],
  },
  {
    name: 'Courses',
    path: '/trainer/course-management',
    requiredRoles: ['Trainer'],
  },
  {
    name: 'Quiz',
    path: '/trainer/quiz-generator',
    requiredRoles: ['Trainer'],
    children: [
      {
        name: 'AI Generated',
        path: '/trainer/quiz-generator',
      },
      {
        name: 'Manual Quiz',
        path: '/trainer/quizmanual',
      },
    ],
  },
  {
    name: 'Action Calendar', // unified calendar link
    path: '/trainer/calendar',
    requiredRoles: ['Trainer'],
  },

  // ------------------ Trainee ------------------
  {
    name: 'Dashboard',
    path: '/trainee/dashboard',
    requiredRoles: ['Trainee'],
  },
  {
    name: 'My Courses',
    path: '/trainee/courses',
    requiredRoles: ['Trainee'],
  },
  {
    name: 'Assessment',
    path: '/trainee/assessment',
    requiredRoles: ['Trainee'],
  },
  {
    name: 'Action Calendar', // unified calendar link
    path: '/trainee/calendar',
    requiredRoles: ['Trainee'],
  },
];