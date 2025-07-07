import { Session, User } from '@supabase/supabase-js';

export type AuthProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  signOut?: () => void;
};
