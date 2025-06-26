
-- Seed data for testing
-- Insert sample barbershops
INSERT INTO public.barbershops (id, name, address, phone) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Barbearia Central', 'Rua das Flores, 123 - Centro', '(11) 99999-0001'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Corte & Estilo', 'Av. Paulista, 456 - Bela Vista', '(11) 99999-0002'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Barbearia do João', 'Rua Augusta, 789 - Consolação', '(11) 99999-0003');

-- Insert sample services
INSERT INTO public.services (name, duration, price, description, barbershop_id) VALUES
  ('Corte Masculino', 30, 25.00, 'Corte de cabelo masculino tradicional', '550e8400-e29b-41d4-a716-446655440001'),
  ('Barba', 20, 15.00, 'Aparar e modelar barba', '550e8400-e29b-41d4-a716-446655440001'),
  ('Corte + Barba', 45, 35.00, 'Corte completo com barba', '550e8400-e29b-41d4-a716-446655440001'),
  ('Sobrancelha', 15, 10.00, 'Design de sobrancelha masculina', '550e8400-e29b-41d4-a716-446655440001'),
  
  ('Corte Premium', 40, 40.00, 'Corte premium com acabamento especial', '550e8400-e29b-41d4-a716-446655440002'),
  ('Barba Premium', 30, 25.00, 'Barba com tratamento especial', '550e8400-e29b-41d4-a716-446655440002'),
  ('Pacote Completo', 60, 60.00, 'Corte, barba e sobrancelha', '550e8400-e29b-41d4-a716-446655440002'),
  
  ('Corte Tradicional', 25, 20.00, 'Corte tradicional de barbearia', '550e8400-e29b-41d4-a716-446655440003'),
  ('Barba Clássica', 25, 18.00, 'Barba no estilo clássico', '550e8400-e29b-41d4-a716-446655440003'),
  ('Bigode', 10, 8.00, 'Aparar e modelar bigode', '550e8400-e29b-41d4-a716-446655440003');

