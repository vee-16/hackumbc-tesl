-- Supabase Database Schema for AI Support Ticket System
-- Run this in your Supabase SQL editor to set up the database

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    predicted_type VARCHAR(50),
    predicted_urgency VARCHAR(20),
    confidence_type DECIMAL(5,4),
    confidence_urgency DECIMAL(5,4),
    assistance_provided JSONB,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(predicted_type);
CREATE INDEX IF NOT EXISTS idx_tickets_urgency ON tickets(predicted_urgency);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (adjust based on your auth needs)
CREATE POLICY "Allow all operations on tickets" ON tickets
    FOR ALL USING (true);

-- Optional: Create a view for ticket statistics
CREATE OR REPLACE VIEW ticket_stats AS
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN predicted_type = 'hardware' THEN 1 END) as hardware_tickets,
    COUNT(CASE WHEN predicted_type = 'software' THEN 1 END) as software_tickets,
    COUNT(CASE WHEN predicted_type = 'network' THEN 1 END) as network_tickets,
    COUNT(CASE WHEN predicted_type = 'account' THEN 1 END) as account_tickets,
    COUNT(CASE WHEN predicted_type = 'other' THEN 1 END) as other_tickets,
    COUNT(CASE WHEN predicted_urgency = 'high' THEN 1 END) as high_urgency,
    COUNT(CASE WHEN predicted_urgency = 'medium' THEN 1 END) as medium_urgency,
    COUNT(CASE WHEN predicted_urgency = 'low' THEN 1 END) as low_urgency,
    COUNT(CASE WHEN status = 'classified' THEN 1 END) as classified_tickets,
    COUNT(CASE WHEN status = 'assisted' THEN 1 END) as assisted_tickets
FROM tickets;

-- Insert some sample data for testing (optional)
INSERT INTO tickets (text, predicted_type, predicted_urgency, confidence_type, confidence_urgency, status) VALUES
('My laptop won''t start and the screen stays black', 'hardware', 'high', 0.95, 0.88, 'classified'),
('Excel keeps crashing when I open large files', 'software', 'medium', 0.92, 0.75, 'classified'),
('Cannot connect to the office WiFi network', 'network', 'medium', 0.89, 0.82, 'classified'),
('Forgot my password and cannot log into email', 'account', 'high', 0.96, 0.91, 'classified'),
('Need help setting up a new printer', 'other', 'low', 0.78, 0.65, 'classified');

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON tickets TO authenticated;
-- GRANT ALL ON ticket_stats TO authenticated;
