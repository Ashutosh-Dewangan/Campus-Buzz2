// ============================================================
// CAMPUS BUZZ API FAÇADE
// Re-exports all domain service modules with resilient mock fallbacks.
// ============================================================

export * from "./api/index";
export type { ChatRoomData as ChatRoom } from "./api/rooms";