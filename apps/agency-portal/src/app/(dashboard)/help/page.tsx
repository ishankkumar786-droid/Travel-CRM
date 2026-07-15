import type { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, MessageSquare, ExternalLink, BookOpen, HelpCircle } from 'lucide-react';

export const metadata: Metadata = { title: 'Help & Support' };

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Get help with your agency portal</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: BookOpen,
            title: 'Documentation',
            description: 'Browse our guides and tutorials to get the most out of the platform.',
            action: 'View Docs',
          },
          {
            icon: MessageSquare,
            title: 'Live Chat',
            description: 'Chat with our support team for immediate assistance.',
            action: 'Start Chat',
          },
          {
            icon: Mail,
            title: 'Email Support',
            description: 'Send us an email and we will get back to you within 24 hours.',
            action: 'Send Email',
          },
          {
            icon: Phone,
            title: 'Phone Support',
            description: 'Call us directly for urgent issues. Mon-Fri, 9 AM - 6 PM IST.',
            action: 'Call Now',
          },
          {
            icon: HelpCircle,
            title: 'FAQs',
            description: 'Find answers to commonly asked questions about the portal.',
            action: 'View FAQs',
          },
          {
            icon: ExternalLink,
            title: 'Community Forum',
            description: 'Connect with other agencies and share tips and best practices.',
            action: 'Join Forum',
          },
        ].map((item) => (
          <Card key={item.title} className="card-hover">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                {item.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
