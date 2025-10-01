import { useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center glass rounded-xl p-8 border">
        <h1 className="text-5xl font-extrabold mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-4">Oops! Page not found</p>
        <NavLink to="/" className="story-link">
          Return to Home
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
