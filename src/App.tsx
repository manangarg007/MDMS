import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes';
import { ThemeProvider } from './shared/theme';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
