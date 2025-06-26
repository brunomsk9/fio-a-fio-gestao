
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super-admin', 'admin', 'barber', 'client')),
  barbershop_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barbershops table
CREATE TABLE public.barbershops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barbers table (many-to-many relationship with barbershops)
CREATE TABLE public.barbers (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create barber_barbershops junction table
CREATE TABLE public.barber_barbershops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barber_id, barbershop_id)
);

-- Create working_hours table
CREATE TABLE public.working_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time TIME,
  end_time TIME,
  is_working BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barber_id, barbershop_id, day_of_week)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for users.barbershop_id
ALTER TABLE public.users 
ADD CONSTRAINT users_barbershop_id_fkey 
FOREIGN KEY (barbershop_id) REFERENCES public.barbershops(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_barbershop_id ON public.users(barbershop_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_barber_id ON public.bookings(barber_id);
CREATE INDEX idx_bookings_barbershop_id ON public.bookings(barbershop_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_barber_barbershops_barber_id ON public.barber_barbershops(barber_id);
CREATE INDEX idx_barber_barbershops_barbershop_id ON public.barber_barbershops(barbershop_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super-admin'
    )
  );

CREATE POLICY "Admins can view users in their barbershop" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      AND u.barbershop_id = users.barbershop_id
    )
  );

-- RLS Policies for barbershops table
CREATE POLICY "Anyone can view barbershops" ON public.barbershops
  FOR SELECT TO public USING (true);

CREATE POLICY "Super admins can manage all barbershops" ON public.barbershops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super-admin'
    )
  );

CREATE POLICY "Admins can manage their own barbershop" ON public.barbershops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin' AND barbershop_id = barbershops.id
    )
  );

-- RLS Policies for services table
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage services in their barbershop" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super-admin')
      AND (role = 'super-admin' OR barbershop_id = services.barbershop_id)
    )
  );

-- RLS Policies for barbers table
CREATE POLICY "Anyone can view barbers" ON public.barbers
  FOR SELECT TO public USING (true);

CREATE POLICY "Barbers can update their own profile" ON public.barbers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage barbers" ON public.barbers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
    )
  );

-- RLS Policies for barber_barbershops table
CREATE POLICY "Anyone can view barber-barbershop relationships" ON public.barber_barbershops
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage barber assignments" ON public.barber_barbershops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super-admin')
      AND (role = 'super-admin' OR barbershop_id = barber_barbershops.barbershop_id)
    )
  );

-- RLS Policies for working_hours table
CREATE POLICY "Anyone can view working hours" ON public.working_hours
  FOR SELECT TO public USING (true);

CREATE POLICY "Barbers can manage their own working hours" ON public.working_hours
  FOR ALL USING (auth.uid() = barber_id);

CREATE POLICY "Admins can manage working hours in their barbershop" ON public.working_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super-admin')
      AND (role = 'super-admin' OR barbershop_id = working_hours.barbershop_id)
    )
  );

-- RLS Policies for bookings table
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view bookings by phone" ON public.bookings
  FOR SELECT TO public USING (true);

CREATE POLICY "Barbers can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = barber_id);

CREATE POLICY "Barbers can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = barber_id);

CREATE POLICY "Admins can manage bookings in their barbershop" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super-admin')
      AND (role = 'super-admin' OR barbershop_id = bookings.barbershop_id)
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON public.barbershops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON public.working_hours FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

