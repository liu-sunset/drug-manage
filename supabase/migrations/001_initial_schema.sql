-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9]{3,20}$')
);

-- 创建 drugs 表
CREATE TABLE IF NOT EXISTS drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  production_date DATE NOT NULL,
  shelf_life_days INTEGER NOT NULL CHECK (shelf_life_days > 0),
  expiry_date DATE NOT NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_drugs_user_id ON drugs(user_id);
CREATE INDEX IF NOT EXISTS idx_drugs_expiry_date ON drugs(expiry_date);
CREATE INDEX IF NOT EXISTS idx_drugs_reminder ON drugs(expiry_date, reminder_sent)
  WHERE reminder_sent = FALSE;

-- updated_at 触发器函数
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles updated_at 触发器
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- drugs updated_at 触发器
DROP TRIGGER IF EXISTS set_drugs_updated_at ON drugs;
CREATE TRIGGER set_drugs_updated_at
  BEFORE UPDATE ON drugs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 创建新用户时自动创建 profile 的函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, 'user_' || substring(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 把触发器挂到 auth.users 表上（新用户注册时自动创建 profile）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;

-- profiles RLS 策略
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- drugs RLS 策略
DROP POLICY IF EXISTS "Users can read own drugs" ON drugs;
CREATE POLICY "Users can read own drugs"
  ON drugs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own drugs" ON drugs;
CREATE POLICY "Users can insert own drugs"
  ON drugs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own drugs" ON drugs;
CREATE POLICY "Users can update own drugs"
  ON drugs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own drugs" ON drugs;
CREATE POLICY "Users can delete own drugs"
  ON drugs FOR DELETE
  USING (auth.uid() = user_id);
