import { useState, type FormEvent } from "react";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { errorMessage } from "../../lib/api-client";
export function LoginPage() {
  const auth = useAuth();
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(auth.error);
  const [busy, setBusy] = useState(false);
  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await auth.signIn(
        { email, password, ...(register ? { name } : {}) },
        register,
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth">
      <div className="auth-story">
        <div className="brand">
          <BookOpen /> folio<span>LIBRARY MANAGEMENT</span>
        </div>
        <div>
          <span className="eyebrow">A WORLD WITHIN REACH</span>
          <h1>
            Your next chapter
            <br />
            starts here.
          </h1>
          <p>
            A thoughtful space for books, curious minds,
            <br />
            and everything you discover along the way.
          </p>
          <div className="book-stack">
            <div>
              THE ART
              <br />
              OF
              <br />
              DISCOVERY
            </div>
            <div>
              STAY
              <br />
              CURIOUS
            </div>
            <div>
              ONE MORE
              <br />
              CHAPTER
            </div>
          </div>
        </div>
        <small>Good books. Great possibilities.</small>
      </div>
      <form className="auth-form" onSubmit={login}>
        <span className="eyebrow">WELCOME TO FOLIO</span>
        <h2>
          {register
            ? "Join the library"
            : "A little curiosity goes a long way."}
        </h2>
        <p>
          {register
            ? "Create a member account to start borrowing."
            : "Sign in to explore your library."}
        </p>
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {register && (
          <label>
            Full name
            <input
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}
        <label>
          Email address
          <input
            autoComplete="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            autoComplete={register ? "new-password" : "current-password"}
            type="password"
            minLength={register ? 10 : 1}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account" : "Sign in"}{" "}
          <ArrowUpRight size={18} />
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register
            ? "Already a member? Sign in"
            : "New here? Create an account"}
        </button>
        <small>Local demo accounts are listed in the project README.</small>
      </form>
    </div>
  );
}
