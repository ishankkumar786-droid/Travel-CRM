'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { verifyReviewToken, submitReview } from '@/lib/api';
import { submitReviewSchema } from '@travel/validation';
import type { ReviewDTO } from '@travel/types';

export function ReviewSubmission({ token }: { token: string }) {
  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // local rating state for interactive stars
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(submitReviewSchema),
    defaultValues: { rating: 0, content: '' },
  });

  const rating = watch('rating');

  useEffect(() => {
    verifyReviewToken(token)
      .then((res) => setReview(res.data as unknown as ReviewDTO))
      .catch((err) => setError(err.message || 'Invalid or expired review link'))
      .finally(() => setLoading(false));
  }, [token]);

  const onSubmit = async (data: { rating: number; content: string }) => {
    try {
      await submitReview(token, data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="bg-card mx-auto mt-10 max-w-md rounded-2xl border p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-bold">Review Link Invalid</h2>
        <p className="text-muted-foreground mb-6">
          {error || 'This review link is invalid or has already been used.'}
        </p>
        <Link
          href="/"
          className="bg-primary inline-block rounded-lg px-6 py-2.5 font-semibold text-white"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (success || review.status === 'published') {
    return (
      <div className="bg-card mx-auto mt-10 max-w-md rounded-2xl border p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Thank You!</h2>
        <p className="text-muted-foreground mb-6">
          Your review has been successfully submitted and is now public. We appreciate your
          feedback!
        </p>
        <Link
          href={`/agencies/${review.agencyId}`}
          className="bg-primary inline-block rounded-lg px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:brightness-110"
        >
          View Agency Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-primary/5 flex flex-col items-center border-b p-6 text-center md:p-8">
          <ShieldCheck className="text-primary mb-3 h-10 w-10" />
          <h1 className="mb-2 text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Verified Review
          </h1>
          <p className="text-muted-foreground">
            Hi {review.travelerName}! You are submitting a verified review. Your honest feedback
            helps other travelers make great decisions.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Stars */}
            <div className="flex flex-col items-center">
              <label className="mb-3 text-lg font-semibold">How was your experience?</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    className="transition-transform hover:scale-110 focus:outline-none active:scale-95"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'fill-muted text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="mt-2 text-sm text-red-500">{errors.rating.message}</p>
              )}
            </div>

            <hr className="border-border" />

            {/* Content Textarea */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Tell us more about your trip
              </label>
              <textarea
                className="focus:ring-primary/50 min-h-[160px] w-full resize-y rounded-xl border bg-transparent p-4 text-sm focus:outline-none focus:ring-2"
                placeholder="What did you love? What could be improved? Share your itinerary highlights..."
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Submit Review'
              )}
            </button>
            <p className="text-muted-foreground mt-4 flex items-center justify-center gap-1 text-center text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              This review will be marked as "Verified Booking" on the agency's profile.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
