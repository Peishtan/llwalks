
-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (one dog per user)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_name TEXT NOT NULL DEFAULT 'Buddy',
  avatar_id TEXT NOT NULL DEFAULT 'default',
  path_position INTEGER NOT NULL DEFAULT 0,
  treat_count INTEGER NOT NULL DEFAULT 0,
  current_month TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activity log
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('walk', 'pee', 'poop')),
  weather TEXT NOT NULL DEFAULT 'sun' CHECK (weather IN ('sun', 'rain')),
  treats_earned INTEGER NOT NULL DEFAULT 0,
  bonus_earned BOOLEAN NOT NULL DEFAULT false,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON public.activity_log FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_activity_log_user_date ON public.activity_log (user_id, logged_at);

-- Unlockables (user's earned items)
CREATE TABLE public.user_unlockables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('cosmetic', 'badge')),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  equipped BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, item_id)
);

ALTER TABLE public.user_unlockables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlockables" ON public.user_unlockables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unlockables" ON public.user_unlockables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unlockables" ON public.user_unlockables FOR UPDATE USING (auth.uid() = user_id);
