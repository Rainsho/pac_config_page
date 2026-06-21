// Edge-safe constants — safe for proxy.ts and middleware
export const constants = {
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtCode: process.env.JWT_CODE || 'change-me',
  jwtCookie: 'token',
  jwtExpiresIn: '7d',
};
