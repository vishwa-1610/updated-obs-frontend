// src/utils/getAvatarUrl.js
export const getAvatarUrl = (seed) => {
  // Using DiceBear Avatars (free, high quality)
  // We use the 'avataaars' collection which is very expressive
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed || 'guest'}`;
};