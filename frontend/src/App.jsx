import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { store, persistor } from './store';
import { router } from './router';
import { ToastContainer } from './components/ui';
import Loading from './components/ui/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingBoundary from './components/common/LoadingBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate 
          loading={
            <LoadingBoundary 
              fallback={<Loading text="Cargando aplicación..." />}
            />
          } 
          persistor={persistor}
        >
          <HelmetProvider>
            <LoadingBoundary 
              loadingMessage="Cargando rutas..."
              onError={(error) => console.error('Error en router:', error)}
            >
              <RouterProvider router={router} />
            </LoadingBoundary>
            <ToastContainer />
          </HelmetProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
