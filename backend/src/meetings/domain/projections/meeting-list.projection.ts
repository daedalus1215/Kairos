import { MeetingDetailProjection } from './meeting-detail.projection';

export type MeetingListProjection = {
  meetings: MeetingDetailProjection[];
  total: number;
};
