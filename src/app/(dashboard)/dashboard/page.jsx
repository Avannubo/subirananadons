import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
    redirect('/dashboard/account');
    return null;
}
