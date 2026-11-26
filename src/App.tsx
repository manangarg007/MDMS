import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes';
import { ToastProvider } from './shared/components';
import { ThemeProvider } from './shared/theme';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
