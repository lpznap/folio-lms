import { AuthProvider, useAuth } from "../features/auth/AuthProvider";
import { LoginPage } from "../features/auth/LoginPage";
import { LibraryPage } from "../features/library/LibraryPage";
function AuthenticatedApp() {
  const { user, ready } = useAuth();
  if (!ready)
    return (
      <div className="auth">
        <p>Opening your library…</p>
      </div>
    );
  return user ? <LibraryPage key={user.id} user={user} /> : <LoginPage />;
}
export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
