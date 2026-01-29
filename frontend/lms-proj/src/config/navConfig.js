// ./src/config/navConfig.js

export const navLinks = [
  // ------------------ Admin ------------------
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    // icon: 'SettingsIcon',
    requiredRoles: ['Admin'], // Only Admin can see this
    translationKey: "nav.dashboard",
  },
  {
    name: 'Course Management',
    path: '/admin/course-management',
    requiredRoles: ['Admin'],
    translationKey: "nav.course_management",
  },
  {
    name: 'User Management',
    path: '/admin/user-management',
    requiredRoles: ['Admin'],
    translationKey: "nav.user_management",
  },
  {
    name: 'Curriculum',
    requiredRoles: ['Admin'],
    translationKey: "nav.curriculum",
    children: [
      {
        name: 'View Batch Table',
        path: '/admin/batch-management',
        translationKey: "nav.view_batch_table",
      },
      {
        name: 'View Module Table',
        path: '/admin/module-management',
        translationKey: "nav.view_module_table",
      },
      {
        name: 'Action Calendar',  // unified calendar link
        path: '/admin/calendar',
        translationKey: "nav.action_calendar",
      },
    ],
  },

  // ------------------ Trainer ------------------
  {
    name: 'Dashboard',
    path: '/trainer/dashboard',
    requiredRoles: ['Trainer'],
    translationKey: "nav.dashboard",
  },
  {
    name: 'Courses',
    path: '/trainer/course-management',
    requiredRoles: ['Trainer'],
    translationKey: "nav.courses",
  },
  {
    name: 'Create Assessment',
    path: '/trainer/quiz-generator',
    requiredRoles: ['Trainer'],
    translationKey: "nav.quiz",
    children: [
      {
        name: 'AI Generated',
        path: '/trainer/quiz-generator',
        translationKey: "nav.ai_generated",
      },
      {
        name: 'Manual Quiz',
        path: '/trainer/quizmanual',
        translationKey: "nav.manual_quiz",
      },]
  },
  {
    name: 'View Grades',
    path: '/trainer/view-grades',
    requiredRoles: ['Trainer'],
    translationKey: "nav.view_grades",
  },
  {
    name: 'Action Calendar', // unified calendar link
    path: '/trainer/calendar',
    requiredRoles: ['Trainer'],
    translationKey: "nav.action_calendar",
  },

  // ------------------ Trainee ------------------
  {
    name: 'Dashboard',
    path: '/trainee/dashboard',
    requiredRoles: ['Trainee'],
    translationKey: "nav.dashboard",
  },
  {
    name: 'My Courses',
    path: '/trainee/courses',
    // icon: 'SchoolIcon',
    requiredRoles: ['Trainee'], // Only Students
    translationKey: "nav.my_courses",
  },
  {
    name: 'Assessment',
    path: '/trainee/assessment',
    requiredRoles: ['Trainee'],
    translationKey: "nav.assessment",
  },
  {
    name: 'Action Calendar', // unified calendar link
    path: '/trainee/calendar',
    requiredRoles: ['Trainee'],
  },
];