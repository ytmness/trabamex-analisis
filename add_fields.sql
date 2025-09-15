ALTER TABLE service_orders ADD COLUMN operator_id uuid REFERENCES profiles(id);
