-- Add cancellation_reason column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Update status check constraint to include 'cancellation_requested'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_status_check') THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;
    END IF;
END $$;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'awaiting_confirmation', 'cancellation_requested'));
