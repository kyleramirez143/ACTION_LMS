// ./src/config/navConfig.js

// Change what is needed for each role.
// Check what each role can access. Add something if it's not yet included.
export const navLinks = [
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
        name: 'Action Calendar',
        path: '/admin/calendar',
        translationKey: "nav.action_calendar",
      },
    ],
  },
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
    name: 'Assessment',
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
    name: 'Action Calendar',
    path: '/trainer/calendar',
    requiredRoles: ['Trainer'],
    translationKey: "nav.action_calendar",
  },
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
  // {
  //   name: 'Profile',
  //   path: '/profile',
  //   // icon: 'UserIcon',
  //   requiredRoles: ['Admin', 'Trainer', 'Trainee'],
  // },
];