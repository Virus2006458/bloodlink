export type UserRole = 'donor' | 'receiver';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  blood_group: string;
  city: string;
  availability_status: boolean;
  created_at?: string;
}

export interface BloodRequest {
  id: string;
  receiver_id: string;
  donor_id: string | null;
  blood_group: string;
  city: string;
  notes: string | null;
  prescription_url: string | null;
  patient_photo_url: string | null;
  patient_name: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'fulfilled';
  created_at: string;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}
