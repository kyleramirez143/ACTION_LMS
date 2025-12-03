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
    requiredRoles: ['Admin', 'Trainer'],
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
    name: 'Lecture Management',
    path: '/admin/module-management/create',
    requiredRoles: ['Trainer'],
  },
  {
    name: 'Quiz Generator',
    path: '/trainer/quiz-generator',
    requiredRoles: ['Trainer'],
  },
  {
    name: 'My Courses',
    path: '/student/dashboard',
    // icon: 'SchoolIcon',
    requiredRoles: ['Trainee'], // Only Students
  },
  // {
  //   name: 'Profile',
  //   path: '/profile',
  //   // icon: 'UserIcon',
  //   requiredRoles: ['Admin', 'Trainer', 'Trainee'],
  // },
];