import { supabase } from '../utils/supabase';
import { User, SignUpInput, SignInInput, Profile } from '../types/user.types';
import { AuthenticationError } from '../utils/errors';

export const authService = {
  async signUp(input: SignUpInput): Promise<{ user: User; session: any }> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
        },
      },
    });

    if (error) throw new AuthenticationError(error.message);
    if (!data.user) throw new AuthenticationError('Помилка реєстрації');

    return {
      user: { id: data.user.id, email: data.user.email! },
      session: data.session,
    };
  },

  async signIn(input: SignInInput): Promise<{ user: User; session: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw new AuthenticationError(error.message);
    if (!data.user) throw new AuthenticationError('Помилка входу');

    return {
      user: { id: data.user.id, email: data.user.email! },
      session: data.session,
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(token: string): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    return { id: user.id, email: user.email! };
  },

  async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data;
  },

  async isAdmin(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile?.role === 'admin';
  },
};
