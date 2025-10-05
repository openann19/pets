module.exports = {
  purchase: async (userId) => {
    // pretend network delay
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, message: 'Premium activated (mock).' };
  },
};
