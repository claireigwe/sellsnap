import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';
import OnboardingFlow from './OnboardingFlow';

export default async function OnboardingPage() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    redirect('/auth');
  }

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <CardContent className={styles.content}>
          <OnboardingFlow userName={session.user.name?.split(' ')[0] || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
