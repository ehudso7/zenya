-- Create audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE')),
  details JSONB,
  metadata JSONB,
  compliance_tags TEXT[],
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON audit.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit.audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON audit.audit_logs(severity);
CREATE INDEX idx_audit_logs_outcome ON audit.audit_logs(outcome);
CREATE INDEX idx_audit_logs_resource ON audit.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_compliance ON audit.audit_logs USING GIN (compliance_tags);

-- Create a view for common queries
CREATE VIEW audit.user_activity AS
SELECT 
  al.id,
  al.timestamp,
  al.event_type,
  al.severity,
  al.user_id,
  al.user_email,
  al.action,
  al.outcome,
  al.ip_address,
  al.details,
  u.raw_user_meta_data->>'name' as user_name
FROM audit.audit_logs al
LEFT JOIN auth.users u ON al.user_id = u.id
ORDER BY al.timestamp DESC;

-- Create a function to automatically clean old audit logs
CREATE OR REPLACE FUNCTION audit.cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 2 years (configurable based on compliance requirements)
  DELETE FROM audit.audit_logs
  WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- This is an example; actual scheduling depends on your infrastructure
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT audit.cleanup_old_logs();');

-- Row-level security policies
ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can do everything" ON audit.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users (read their own logs)
CREATE POLICY "Users can view their own audit logs" ON audit.audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for admin role (read all logs)
CREATE POLICY "Admins can view all audit logs" ON audit.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create a function to verify audit log integrity
CREATE OR REPLACE FUNCTION audit.verify_log_integrity(log_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  log_record audit.audit_logs%ROWTYPE;
  expected_hash TEXT;
BEGIN
  SELECT * INTO log_record FROM audit.audit_logs WHERE id = log_id;
  
  IF log_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Note: This is a simplified version. In production, you'd use the same
  -- hashing algorithm as your application
  expected_hash := encode(
    digest(
      log_record.timestamp::TEXT || 
      log_record.event_type || 
      COALESCE(log_record.user_id::TEXT, '') || 
      log_record.action || 
      log_record.outcome,
      'sha256'
    ),
    'hex'
  );
  
  RETURN log_record.hash = expected_hash;
END;
$$ LANGUAGE plpgsql;

-- Create audit summary table for reporting
CREATE TABLE IF NOT EXISTS audit.audit_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  event_type TEXT NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, event_type)
);

-- Function to update audit summary
CREATE OR REPLACE FUNCTION audit.update_audit_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.audit_summary (
    date,
    event_type,
    total_count,
    success_count,
    failure_count,
    unique_users
  )
  VALUES (
    DATE(NEW.timestamp),
    NEW.event_type,
    1,
    CASE WHEN NEW.outcome = 'SUCCESS' THEN 1 ELSE 0 END,
    CASE WHEN NEW.outcome = 'FAILURE' THEN 1 ELSE 0 END,
    CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, event_type) DO UPDATE SET
    total_count = audit.audit_summary.total_count + 1,
    success_count = audit.audit_summary.success_count + 
      CASE WHEN NEW.outcome = 'SUCCESS' THEN 1 ELSE 0 END,
    failure_count = audit.audit_summary.failure_count + 
      CASE WHEN NEW.outcome = 'FAILURE' THEN 1 ELSE 0 END,
    unique_users = (
      SELECT COUNT(DISTINCT user_id)
      FROM audit.audit_logs
      WHERE DATE(timestamp) = DATE(NEW.timestamp)
      AND event_type = NEW.event_type
      AND user_id IS NOT NULL
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit summary
CREATE TRIGGER update_audit_summary_trigger
AFTER INSERT ON audit.audit_logs
FOR EACH ROW
EXECUTE FUNCTION audit.update_audit_summary();

-- Grant permissions
GRANT USAGE ON SCHEMA audit TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA audit TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA audit TO service_role;