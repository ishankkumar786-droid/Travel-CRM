'use client';

import {
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Award,
  ShieldCheck,
  Star,
  Eye,
  Edit,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

/* ─── Score Ring ────────────────────────────────────────────────────────────── */

function ScoreRing({
  score,
  label,
  color,
  size = 80,
}: {
  score: number;
  label: string;
  color: string;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{score}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

/* ─── Checklist Item ───────────────────────────────────────────────────────── */

function ChecklistItem({
  label,
  completed,
  description,
}: {
  label: string;
  completed: boolean;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {completed ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
      ) : (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      )}
      <div>
        <p className={cn('text-sm font-medium', completed && 'text-muted-foreground')}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function MarketplaceContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace Profile</h1>
          <p className="text-muted-foreground">
            Your public-facing profile on the Travel Marketplace
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Scores Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Readiness</CardTitle>
          <CardDescription>
            Improve your scores to boost visibility and attract more customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:justify-start">
            <ScoreRing score={85} label="Overall Score" color="hsl(var(--primary))" size={96} />
            <ScoreRing score={90} label="Profile" color="hsl(var(--success))" />
            <ScoreRing score={75} label="Verification" color="hsl(var(--warning))" />
            <ScoreRing score={80} label="Trust" color="hsl(var(--info))" />
            <ScoreRing score={92} label="Content" color="hsl(var(--accent))" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Preview — 2 cols */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            {/* Banner */}
            <div className="relative h-40 rounded-t-lg bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10">
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-3 right-3 backdrop-blur-sm"
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Change Banner
              </Button>
            </div>

            {/* Agency Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                {/* Logo */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-4 border-background bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                  TM
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Travel Masters India</h2>
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Premium travel agency specializing in luxury and adventure tours across India
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-4 gap-4 border-t pt-4">
                {[
                  { label: 'Packages', value: '12' },
                  { label: 'Reviews', value: '32' },
                  { label: 'Rating', value: '4.8' },
                  { label: 'Years Active', value: '8' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Luxury Tours', 'Adventure', 'Honeymoon', 'Group Travel', 'Corporate'].map(
                  (tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ),
                )}
              </div>

              {/* Social Links */}
              <div className="mt-4 flex items-center gap-3">
                {[
                  { icon: Globe, label: 'Website' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Linkedin, label: 'LinkedIn' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Readiness Checklist — 1 col */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Readiness Checklist</CardTitle>
              <Badge variant="success">5/7</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              <ChecklistItem label="Business profile complete" completed />
              <ChecklistItem label="Logo & banner uploaded" completed />
              <ChecklistItem label="GST verification" completed />
              <ChecklistItem label="At least 3 packages listed" completed />
              <ChecklistItem label="Bank details added" completed />
              <ChecklistItem
                label="Social links added"
                completed={false}
                description="Add at least 2 social media links"
              />
              <ChecklistItem
                label="Customer reviews"
                completed={false}
                description="Get at least 5 verified reviews"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Awards & Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Awards & Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'IATA Certified', icon: Award, description: 'International Air Transport Association' },
              { title: 'Verified Agency', icon: ShieldCheck, description: 'Travel Marketplace Verified' },
              { title: 'Top Rated 2025', icon: Star, description: 'Top 10 Agencies in India' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="rounded-lg bg-accent/10 p-2.5 text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
