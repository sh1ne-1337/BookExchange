import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { RouteErrorPage } from '@/pages/route-error-page';
import { GuestRoute, ProtectedRoute } from '@/routes/guards';

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: '/login',
                lazy: () => import('@/pages/login-page').then((m) => ({ Component: m.LoginPage })),
              },
              {
                path: '/forgot-password',
                lazy: () =>
                  import('@/pages/forgot-password-page').then((m) => ({
                    Component: m.ForgotPasswordPage,
                  })),
              },
              {
                path: '/reset-password',
                lazy: () =>
                  import('@/pages/reset-password-page').then((m) => ({
                    Component: m.ResetPasswordPage,
                  })),
              },
              {
                path: '/register',
                lazy: () =>
                  import('@/pages/register-page').then((m) => ({ Component: m.RegisterPage })),
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                errorElement: <RouteErrorPage />,
                children: [
                  { path: '/', element: <Navigate to="/books" replace /> },
                  {
                    path: '/books',
                    lazy: () =>
                      import('@/pages/books-page').then((m) => ({ Component: m.BooksPage })),
                  },
                  {
                    path: '/books/:id',
                    lazy: () =>
                      import('@/pages/book-details-page').then((m) => ({
                        Component: m.BookDetailsPage,
                      })),
                  },
                  {
                    path: '/me/books',
                    lazy: () =>
                      import('@/pages/my-books-page').then((m) => ({ Component: m.MyBooksPage })),
                  },
                  {
                    path: '*',
                    lazy: () =>
                      import('@/pages/not-found-page').then((m) => ({ Component: m.NotFoundPage })),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
