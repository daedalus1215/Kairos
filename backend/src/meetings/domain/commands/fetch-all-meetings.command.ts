export interface FetchAllMeetingsParams {
  userId: number;
  options?: { status?: string; limit?: number; offset?: number };
}
