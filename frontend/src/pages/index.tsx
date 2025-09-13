import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import PlacesApp from '../components/PlacesApp';

const queryClient = new QueryClient();

const Home = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PlacesApp />
    </QueryClientProvider>
  );
};

export default Home;
