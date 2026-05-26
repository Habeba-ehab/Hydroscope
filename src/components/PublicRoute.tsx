import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const PublicRoute = () => {
  const token = Cookies.get('access_token') || Cookies.get('refresh_token');

  // If token exists, redirect to home (don't show login/signup to logged-in users)
  if (token) {
    return <Navigate to="/" replace />;
  }

  // If no token, render the auth pages
  return <Outlet />;
};

export default PublicRoute;
