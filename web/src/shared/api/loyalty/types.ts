export type JekoSettings = { points_per_1000: number; welcome_bonus: number };
export type JekoTierConfig = {
  label: string;
  min: number;
  next: number | null;
  emoji: string;
  color: string;
  bg: string;
  textColor: string;
};
export type JekoRewardConfig = {
  id: string;
  pts: number;
  label: string;
  icon: string;
  description: string;
  active: boolean;
};
export type JekoMember = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  points: number;
  created_at: string;
};
export type JekoTransactionAdmin = {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  label: string | null;
  reference_id: string | null;
  created_at: string;
};
export type JekoStats = {
  totalMembers: number;
  totalPointsDistributed: number;
  totalRedemptions: number;
};
