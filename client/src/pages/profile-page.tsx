import { ArrowLeftRight, BookMarked, CalendarDays, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSpinner } from '@/components/ui/spinner';
import { ExchangeRequestsList } from '@/features/profile/components/exchange-requests-list';
import { ProfileForm } from '@/features/profile/components/profile-form';
import { useIncomingExchangeRequests, useProfile } from '@/features/profile/hooks/use-profile';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

export function ProfilePage() {
  const { data: profile, isPending } = useProfile();
  const { data: requests } = useIncomingExchangeRequests();

  if (isPending || !profile) return <PageSpinner />;

  return (
    <>
      <PageHeader title="Profile" description="Manage your account and exchange requests" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Personal information" className="lg:col-span-2">
          <ProfileForm user={profile} />
        </Card>

        <Card title="Activity">
          <dl className="space-y-4">
            <Stat icon={BookMarked} label="Books shared" value={profile.booksCount} />
            <Stat
              icon={ArrowLeftRight}
              label="Exchange requests"
              value={requests ? requests.length : <Skeleton className="h-5 w-6" />}
            />
            <Stat icon={CalendarDays} label="Member since" value={formatDate(profile.createdAt)} />
          </dl>
        </Card>

        <Card title="Incoming exchange requests" className="lg:col-span-3">
          {requests ? <ExchangeRequestsList requests={requests} /> : <Skeleton className="h-24" />}
        </Card>
      </div>
    </>
  );
}

function Card({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200', className)}>
      <h2 className="mb-6 font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
        <Icon className="size-4" aria-hidden />
      </div>
      <dt className="flex-1 text-sm text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
