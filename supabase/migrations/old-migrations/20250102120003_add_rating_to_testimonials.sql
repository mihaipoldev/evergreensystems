-- Add rating column to testimonials table
ALTER TABLE public.testimonials
ADD COLUMN rating REAL CHECK (rating >= 1.0 AND rating <= 5.0);

-- Add comment to document the column
COMMENT ON COLUMN public.testimonials.rating IS 'Testimonial rating from 1.0 to 5.0, in 0.5 increments';
