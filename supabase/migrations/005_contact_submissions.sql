-- Create contact_submissions table for storing contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'resolved', 'spam')),
    notes TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only (contact submissions are sensitive)
-- In production, you'd want specific admin roles, but for now we'll restrict access
CREATE POLICY "Admin only access to contact submissions" ON public.contact_submissions
    FOR ALL USING (false); -- No public access, only via service role

-- Create trigger for updated_at
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add comment for clarity
COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions with tracking information';
COMMENT ON COLUMN public.contact_submissions.status IS 'Tracks the status of contact form response: pending, responded, resolved, spam';
COMMENT ON COLUMN public.contact_submissions.ip_address IS 'IP address of the submitter for spam prevention';
COMMENT ON COLUMN public.contact_submissions.user_agent IS 'User agent string for analytics and spam detection';