-- Trigger para impedir agendamento duplo de barbeiro no mesmo horário em qualquer barbearia
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE barber_id = NEW.barber_id
      AND date = NEW.date
      AND time = NEW.time
      AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Barbeiro já possui agendamento neste horário em outra barbearia.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_double_booking ON bookings;
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION prevent_double_booking(); 