// User Management Routes (using optimized adminController)
const {
  getAllUsers,
  getUserDetails,
  getUserActivity,
  getAllChats,
  getChatDetails
} = require('../controllers/adminController.optimized');

// User Management Routes
router.get('/users', checkPermission('users:read'), adminActionLogger('VIEW_USERS'), getAllUsers);
router.get('/users/:id', checkPermission('users:read'), adminActionLogger('VIEW_USER_DETAILS'), getUserDetails);
router.get('/users/:id/activity', checkPermission('users:read'), adminActionLogger('VIEW_USER_ACTIVITY'), getUserActivity);

// Chat Moderation Routes
router.get('/chats', checkPermission('chats:read'), adminActionLogger('VIEW_CHATS'), getAllChats);
router.get('/chats/:id', checkPermission('chats:read'), adminActionLogger('VIEW_CHAT_DETAILS'), getChatDetails);
