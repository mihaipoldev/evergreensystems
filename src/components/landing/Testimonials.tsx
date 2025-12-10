"use client";

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { RichText } from '@/components/ui/RichText';
import type { Testimonial } from '@/features/testimonials/types';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type TestimonialsProps = {
  testimonials?: Testimonial[];
  section?: Section;
};

const defaultTestimonials = [
  {
    name: 'Ehab Darwish',
    role: 'Founder @ iSkala',
    headline: '2x MRR for outbound Agency',
    body: 'Scaling from $8K to $18K MRR in 2.5 months, refining offer structure, positioning, and adopting a new internal "Legen" approach.',
    date: 'Aug 21, 2025',
    avatar: 'ED',
    hasIcon: true,
  },
  {
    name: 'David Lichtenstein',
    role: 'CEO & Co-Founder',
    headline: 'Great value from arguably the top prospecting business on the planet',
    body: '',
    date: 'Jun 4, 2025',
    avatar: 'DL',
  },
  {
    name: 'Tash Muraldo',
    role: 'Founder - GTM Engineer',
    headline: 'This program helped me hone in on the challenges',
    body: 'That are happening with AI and outbound and how all these tools work in harmony with each other.',
    date: 'Jun 4, 2025',
    avatar: 'TM',
  },
  {
    name: 'Deisy Perez',
    role: 'Chief Strategy Officer at WarmUp',
    headline: 'Added 10 new clients over 3 months',
    body: 'And significantly improved service delivery quality. Comprehensive training on tools like Clay helped gain clients and deliver great results.',
    date: 'Aug 19, 2025',
    avatar: 'DP',
  },
  {
    name: 'Joel Kuusamo',
    role: 'Founder',
    headline: 'Great way to stay up to date on new trends',
    body: 'This has been a great way to stay up to date on new trends and innovations + the community is great for solving all kinds of problems from list building to agency management.',
    date: 'Jun 4, 2025',
    avatar: 'JK',
  },
  {
    name: 'Deisy Lewis',
    role: 'Chief Strategy Officer',
    headline: 'Comprehensive training on using tools like Clay',
    body: 'The comprehensive training on using tools like Clay has helped us gain 10 clients, and we\'ve been able to deliver great results for each of them.',
    date: 'Jun 4, 2025',
    avatar: 'DL',
  },
  {
    name: 'Justin Morgan',
    role: 'Founder & Head of Growth',
    headline: '4x return on investment within 3 months',
    body: 'Quadrupling investment and building infrastructure to scale my business and support others.',
    date: 'Aug 19, 2025',
    avatar: 'JM',
  },
  {
    name: 'Lazar Radivojevic',
    role: 'Founder',
    headline: '3x increase in MRR and scalable internal operations',
    body: 'Ready for growth. Highlights insights into agency management as useful and unexpected benefits.',
    date: 'Jun 4, 2025',
    avatar: 'LR',
  },
  {
    name: 'Rafael von Corvin',
    role: 'Outbound Sales Beratung & operativ...',
    headline: 'The biggest value in the program',
    body: 'Is that any bottleneck you encounter gets solved immediately.',
    date: 'Jun 4, 2025',
    avatar: 'RC',
  },
];

const StarRating = ({ rating }: { rating?: number | null }) => {
  // Default to 5 stars if no rating provided (for backwards compatibility)
  const displayRating = rating ?? 5;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex gap-0.5 mb-3">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className="w-4 h-4 text-yellow-400"
        />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <FontAwesomeIcon
          key="half"
          icon={faStarHalfStroke}
          className="w-4 h-4 text-yellow-400"
        />
      )}
      {/* Empty stars - using solid star with reduced opacity */}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="w-4 h-4 text-yellow-400 opacity-30"
        />
      ))}
    </div>
  );
};

const Avatar = memo(({ initials, avatarUrl }: { initials: string; avatarUrl?: string | null }) => {
  if (avatarUrl) {
    return (
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border relative">
        <Image
          src={avatarUrl}
          alt={initials}
          fill
          className="object-cover"
          sizes="48px"
          onError={() => {
            // Fallback handled by showing initials div below
          }}
        />
        {/* Fallback initials - hidden by default, shown if image fails */}
        <div className="absolute inset-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 opacity-0 pointer-events-none">
          <span className="text-foreground font-semibold text-sm">{initials}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
      <span className="text-foreground font-semibold text-sm">{initials}</span>
    </div>
  );
});

Avatar.displayName = 'Avatar';

export const Testimonials = memo(({ testimonials = [], section }: TestimonialsProps) => {
  // Use section title if available, otherwise fallback to default
  const title = section?.title || 'Hear what others are [[saying]]';
  
  // Use provided testimonials or fall back to hardcoded defaults
  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;
  
  // Map database testimonials to display format - memoized to prevent recalculation
  const mappedTestimonials = useMemo(() => displayTestimonials.map((t: any) => {
    // If it's from database (has quote or author_name field), map the fields
    if (t.quote || t.author_name) {
      // Use correct database field names: author_name and author_role
      const name = t.author_name || t.name || 'Unknown';
      const role = t.author_role || t.role || 'Customer';
      
      // Safely get initials from name
      const initials = name.split(' ')
        .filter((n: string) => n.length > 0)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U';
      
      const quote = t.quote || '';
      
      // Use headline from database if available, otherwise split quote
      const headline = t.headline || (quote ? quote.split('.')[0] : '');
      const body = quote && !t.headline ? quote.split('.').slice(1).join('.').trim() : quote;
      
      return {
        name: name,
        role: role,
        headline: headline || quote,
        body: body || '',
        date: new Date(t.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        avatar: initials,
        avatarUrl: t.avatar_url || null,
        rating: t.rating || null,
        hasIcon: false,
      };
    }
    // Otherwise it's already in the right format (hardcoded)
    return t;
  }), [displayTestimonials]);

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <RichText
            as="h2"
            text={title}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-tight"
          />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappedTestimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="relative"
            >
              <div className="relative h-full rounded-xl border border-border bg-card p-6 flex flex-col">
                {/* Optional Icon in top-right */}
                {testimonial.hasIcon && (
                  <div className="absolute top-4 right-4 w-6 h-6 flex gap-0.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-pink-500 rounded-sm" />
                  </div>
                )}

                {/* Header with Avatar and Name */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar initials={testimonial.avatar} avatarUrl={testimonial.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    {/* Author Name - Top */}
                    <h3 className="text-foreground font-semibold text-base leading-tight">
                      {testimonial.name}
                    </h3>
                    {/* Author Role - Below */}
                    <p className="text-muted-foreground text-sm mt-1">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                {/* Star Rating */}
                <StarRating rating={testimonial.rating} />

                {/* Headline */}
                <h4 className="text-foreground font-semibold text-base mb-3 leading-tight">
                  {testimonial.headline}
                </h4>

                {/* Body Text */}
                {testimonial.body && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                    {testimonial.body}
                  </p>
                )}

                {/* Date */}
                <p className="text-muted-foreground text-xs mt-auto">
                  {testimonial.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

Testimonials.displayName = 'Testimonials';

