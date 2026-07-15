'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Send, Plus, Search, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { reviewService } from '@/lib/api-client';
import { reviewRequestSchema } from '@travel/validation';
import type { ReviewDTO, ReviewRequestInput } from '@travel/types';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

export function ReviewsContent() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewRequestInput>({
    resolver: zodResolver(reviewRequestSchema),
  });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getReviews();
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to load reviews', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const onSubmit = async (data: ReviewRequestInput) => {
    try {
      const res = await reviewService.requestReview(data);
      // Construct the frontend link (Customer Portal runs on port 3002 usually)
      const customerPortalUrl =
        process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL || 'http://localhost:3002';
      const link = `${customerPortalUrl}/review/${res.data.token}`;
      setGeneratedLink(link);
      loadReviews();
    } catch (error) {
      console.error('Failed to request review', error);
      toast.error('Failed to generate review link. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage verified customer reviews and send requests.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsModalOpen(true);
            setGeneratedLink(null);
            reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Request Review
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center py-16 text-center">
              <Star className="text-muted-foreground/30 mb-4 h-12 w-12" />
              <p className="text-foreground mb-1 font-semibold">No reviews yet</p>
              <p className="text-sm">Start by sending a review request to a past traveler.</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col justify-between gap-4 py-5 md:flex-row md:items-center"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-base font-semibold">{review.travelerName}</span>
                      <span className="text-muted-foreground bg-muted/50 rounded px-2 py-0.5 text-xs">
                        {review.travelerEmail}
                      </span>
                    </div>

                    {review.status === 'published' ? (
                      <div className="mt-2">
                        <div className="mb-1.5 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`}
                            />
                          ))}
                          <span className="ml-1 flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </span>
                        </div>
                        <p className="text-muted-foreground max-w-2xl text-sm">{review.content}</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          <Clock className="h-3 w-3" /> Pending Review
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Sent on {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Review</DialogTitle>
            <DialogDescription>
              Generate a unique, secure link for a past traveler to verify their booking and leave a
              review.
            </DialogDescription>
          </DialogHeader>

          {!generatedLink ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Traveler Name</label>
                <Input placeholder="e.g. John Doe" {...register('travelerName')} />
                {errors.travelerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.travelerName.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Traveler Email</label>
                <Input type="email" placeholder="john@example.com" {...register('travelerEmail')} />
                {errors.travelerEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.travelerEmail.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Generating...' : 'Generate Review Link'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold">Review Link Generated!</h3>
              <p className="text-muted-foreground text-sm">
                Normally this would be emailed directly to the customer. For now, you can copy the
                link below and send it to them manually.
              </p>

              <div className="bg-muted mt-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap rounded-lg border p-3 font-mono text-xs">
                {generatedLink}
              </div>

              <Button
                onClick={() => window.open(generatedLink, '_blank')}
                variant="outline"
                className="mt-2 w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open Link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
