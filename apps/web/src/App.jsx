import { RouterProvider } from 'react-router-dom';

// project imports
import ThemeCustomization from './themes';
import router from 'routes';
import { AuthProvider } from 'context/AuthContext';
import { ErpDataProvider } from 'context/ErpDataContext';

function App() {
  return (
    <AuthProvider>
      <ErpDataProvider>
        <ThemeCustomization>
          <RouterProvider router={router} />
        </ThemeCustomization>
      </ErpDataProvider>
    </AuthProvider>
  );
}

export default App;
