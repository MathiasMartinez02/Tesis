import { AppProviders } from '@/providers/AppProviders';
import { AppRouter } from '@/routes/AppRouter';

export function App(): JSX.Element {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
