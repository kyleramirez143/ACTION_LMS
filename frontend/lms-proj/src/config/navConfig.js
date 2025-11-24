// ./src/config/navConfig.js

// Change what is needed for each role.
// Check what each role can access. Add something if it's not yet included.
export const navLinks = [
  {
    name: 'Home',
    path: '/',
    icon: 'HomeIcon', // Placeholder for a component or string
    requiredRoles: ['Admin', 'Trainer', 'Trainee'], // All users
  },
  {
    name: 'Admin Dashboard',
    path: '/admin/dashboard',
    // icon: 'SettingsIcon',
    requiredRoles: ['Admin'], // Only Admin can see this
  },
  {
    name: 'Course Management',
    path: '/manager/courses',
    // icon: 'BookIcon',
    requiredRoles: ['Admin', 'Trainer'], // Admin and Manager
  },
  {
    name: 'My Courses',
    path: '/student/dashboard',
    // icon: 'SchoolIcon',
    requiredRoles: ['Trainee'], // Only Students
  },
  {
    name: 'Profile',
    path: '/profile',
    // icon: 'UserIcon',
    requiredRoles: ['Admin', 'Trainer', 'Trainee'],
  },
];