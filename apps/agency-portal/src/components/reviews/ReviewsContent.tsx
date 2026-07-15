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

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ReviewRequestInput>({
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
      const customerPortalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL || 'http://localhost:3002';
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
          <p className="text-muted-foreground mt-1">Manage verified customer reviews and send requests.</p>
        </div>
        <Button onClick={() => { setIsModalOpen(true); setGeneratedLink(null); reset(); }}>
          <Plus className="mr-2 h-4 w-4" /> Request Review
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
              <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="font-semibold text-foreground mb-1">No reviews yet</p>
              <p className="text-sm">Start by sending a review request to a past traveler.</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map(review => (
                <div key={review.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base">{review.travelerName}</span>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/50">
                        {review.travelerEmail}
                      </span>
                    </div>
                    
                    {review.status === 'published' ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 mb-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`} />
                          ))}
                          <span className="text-xs font-medium ml-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-2xl">{review.content}</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending Review
                        </span>
                        <span className="text-xs text-muted-foreground">Sent on {format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
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
              Generate a unique, secure link for a past traveler to verify their booking and leave a review.
            </DialogDescription>
          </DialogHeader>

          {!generatedLink ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Traveler Name</label>
                <Input placeholder="e.g. John Doe" {...register('travelerName')} />
                {errors.travelerName && <p className="text-red-500 text-xs mt-1">{errors.travelerName.message}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Traveler Email</label>
                <Input type="email" placeholder="john@example.com" {...register('travelerEmail')} />
                {errors.travelerEmail && <p className="text-red-500 text-xs mt-1">{errors.travelerEmail.message}</p>}
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Generating...' : 'Generate Review Link'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-6 space-y-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold">Review Link Generated!</h3>
              <p className="text-sm text-muted-foreground">
                Normally this would be emailed directly to the customer. For now, you can copy the link below and send it to them manually.
              </p>
              
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-muted border font-mono text-xs overflow-x-auto whitespace-nowrap">
                {generatedLink}
              </div>
              
              <Button onClick={() => window.open(generatedLink, '_blank')} variant="outline" className="w-full mt-2">
                <ExternalLink className="mr-2 h-4 w-4" /> Open Link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
