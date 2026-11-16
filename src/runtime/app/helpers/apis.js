// helpers/api.js — Central API helper using useHttp composable

const api = {
    // App
  permissions: "/api/userpermission/list",
  database: "/api/userdatabase/get",
  studyClass: "/api/study_class/teacher_class",
  saveToken: "/api/notification/createtoken",
  auth: "/ocsauth/oauth",

  // Users
  userInfo: "/api/v1/users/me",
  userUpdate: "/api/user/profile/update",
  userInfoChangePhone: "/api/user/profile/changePhone",
  userChangeEmail: "/api/user/profile/changeEmail",
  userChangePassword: "/api/user/profile/changePassword",

  // ── AUTH ──
  auth: {
    login: (credentials) => useHttp('/auth/login', { method: 'POST', body: credentials }),
    register: (data) => useHttp('/auth/register', { method: 'POST', body: data }),
    logout: () => useHttp('/auth/logout', { method: 'POST' }),
    me: () => useHttp('/auth/me'),
    refreshToken: () => useHttp('/auth/refresh', { method: 'POST' }),
    forgotPassword: (email) => useHttp('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (data) => useHttp('/auth/reset-password', { method: 'POST', body: data }),
    googleAuth: (token) => useHttp('/auth/google', { method: 'POST', body: { token } }),
    facebookAuth: (token) => useHttp('/auth/facebook', { method: 'POST', body: { token } }),
  },

  // ── EVENTS ──
  events: {
    list: (params) => useHttp('/events', { params }),
    get: (id) => useHttp(`/events/${id}`),
    create: (data) => useHttp('/events', { method: 'POST', body: data }),
    update: (id, data) => useHttp(`/events/${id}`, { method: 'PUT', body: data }),
    delete: (id) => useHttp(`/events/${id}`, { method: 'DELETE' }),
    stats: (id) => useHttp(`/events/${id}/stats`),
  },

  // ── GUESTS ──
  guests: {
    list: (eventId, params) => useHttp(`/events/${eventId}/guests`, { params }),
    get: (eventId, guestId) => useHttp(`/events/${eventId}/guests/${guestId}`),
    create: (eventId, data) => useHttp(`/events/${eventId}/guests`, { method: 'POST', body: data }),
    update: (eventId, guestId, data) => useHttp(`/events/${eventId}/guests/${guestId}`, { method: 'PUT', body: data }),
    delete: (eventId, guestId) => useHttp(`/events/${eventId}/guests/${guestId}`, { method: 'DELETE' }),
    bulkImport: (eventId, data) => useHttp(`/events/${eventId}/guests/import`, { method: 'POST', body: data }),
    export: (eventId) => useHttp(`/events/${eventId}/guests/export`),
    updateRsvp: (eventId, guestId, status) =>
      useHttp(`/events/${eventId}/guests/${guestId}/rsvp`, { method: 'PATCH', body: { status } }),
  },

  // ── TASKS ──
  tasks: {
    list: (eventId, params) => useHttp(`/events/${eventId}/tasks`, { params }),
    get: (eventId, taskId) => useHttp(`/events/${eventId}/tasks/${taskId}`),
    create: (eventId, data) => useHttp(`/events/${eventId}/tasks`, { method: 'POST', body: data }),
    update: (eventId, taskId, data) => useHttp(`/events/${eventId}/tasks/${taskId}`, { method: 'PUT', body: data }),
    delete: (eventId, taskId) => useHttp(`/events/${eventId}/tasks/${taskId}`, { method: 'DELETE' }),
    complete: (eventId, taskId) => useHttp(`/events/${eventId}/tasks/${taskId}/complete`, { method: 'PATCH' }),
  },

  // ── BUDGET ──
  budget: {
    get: (eventId) => useHttp(`/events/${eventId}/budget`),
    update: (eventId, data) => useHttp(`/events/${eventId}/budget`, { method: 'PUT', body: data }),
    addTransaction: (eventId, data) => useHttp(`/events/${eventId}/budget/transactions`, { method: 'POST', body: data }),
    deleteTransaction: (eventId, txId) =>
      useHttp(`/events/${eventId}/budget/transactions/${txId}`, { method: 'DELETE' }),
  },

  // ── CEREMONY ──
  ceremony: {
    get: (eventId) => useHttp(`/events/${eventId}/ceremony`),
    update: (eventId, data) => useHttp(`/events/${eventId}/ceremony`, { method: 'PUT', body: data }),
    addPhase: (eventId, data) => useHttp(`/events/${eventId}/ceremony/phases`, { method: 'POST', body: data }),
    updatePhase: (eventId, phaseId, data) =>
      useHttp(`/events/${eventId}/ceremony/phases/${phaseId}`, { method: 'PUT', body: data }),
    deletePhase: (eventId, phaseId) =>
      useHttp(`/events/${eventId}/ceremony/phases/${phaseId}`, { method: 'DELETE' }),
  },

  // ── INVITATION ──
  invitation: {
    getLetter: (eventId) => useHttp(`/events/${eventId}/invitation/letter`),
    saveLetter: (eventId, data) => useHttp(`/events/${eventId}/invitation/letter`, { method: 'PUT', body: data }),
    send: (eventId, data) => useHttp(`/events/${eventId}/invitation/send`, { method: 'POST', body: data }),
    stats: (eventId) => useHttp(`/events/${eventId}/invitation/stats`),
  },

  // ── GIFTS ──
  gifts: {
    list: (eventId, params) => useHttp(`/events/${eventId}/gifts`, { params }),
    create: (eventId, data) => useHttp(`/events/${eventId}/gifts`, { method: 'POST', body: data }),
    update: (eventId, giftId, data) => useHttp(`/events/${eventId}/gifts/${giftId}`, { method: 'PUT', body: data }),
    delete: (eventId, giftId) => useHttp(`/events/${eventId}/gifts/${giftId}`, { method: 'DELETE' }),
  },

  // ── NOTIFICATIONS ──
  notifications: {
    list: (params) => useHttp('/notifications', { params }),
    markRead: (id) => useHttp(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => useHttp('/notifications/read-all', { method: 'PATCH' }),
    delete: (id) => useHttp(`/notifications/${id}`, { method: 'DELETE' }),
  },

  // ── USER ──
  user: {
    getProfile: () => useHttp('/user/profile'),
    updateProfile: (data) => useHttp('/user/profile', { method: 'PUT', body: data }),
    updatePassword: (data) => useHttp('/user/password', { method: 'PUT', body: data }),
    uploadAvatar: (formData) => useHttp('/user/avatar', { method: 'POST', body: formData }),
    updateSettings: (data) => useHttp('/user/settings', { method: 'PUT', body: data }),
  },
}


export default api