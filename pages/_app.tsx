import { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '../app/context/UserContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
      <Toaster />
    </UserProvider>
  );
}

export default MyApp;