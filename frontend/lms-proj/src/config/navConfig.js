// ./src/config/navConfig.js

// Change what is needed for each role.
// Check what each role can access. Add something if it's not yet included.
export const navLinks = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    // icon: 'SettingsIcon',
    requiredRoles: ['Admin'], // Only Admin can see this
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
    name: 'Quiz Generator',
    path: '/trainer/quiz-generator',
    requiredRoles: ['Trainer'],
  },
  {
    name: 'Dashboard',
    path: '/trainee/dashboard',
    requiredRoles: ['Trainee'],
  },
  {
    name: 'My Courses',
    path: '/trainee/courses',
    // icon: 'SchoolIcon',
    requiredRoles: ['Trainee'], // Only Students
  },
  {
    name: 'Assessment',
    path: '/trainee/assessment',
    requiredRoles: ['Trainee'],
  },
  // {
  //   name: 'Profile',
  //   path: '/profile',
  //   // icon: 'UserIcon',
  //   requiredRoles: ['Admin', 'Trainer', 'Trainee'],
  // },
];