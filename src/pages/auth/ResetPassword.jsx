import * as React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { StorageService } from "../../services/storage";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await StorageService.resetPassword(token, password);

      if (result.success) {
        setSuccess(true);
        // Automatically redirect to login after a few seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(
          result.message ||
            "Failed to reset password. The link might be expired.",
        );
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-8 border border-surface-dim/20 shadow-xl text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-primary mb-4">
            Password Reset Successfully
          </h2>
          <p className="text-secondary mb-8">
            Your password has been successfully updated. You will be redirected
            to the login page shortly.
          </p>
          <Link
            to="/login"
            className="block w-full py-3 signature-gradient text-white rounded-xl font-bold transition-all"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 signature-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-headline font-bold text-2xl">
              A
            </span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">
            Create New Password
          </h1>
          <p className="text-secondary">Please enter your new password below</p>
        </div>

        {/* Form */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-dim/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-secondary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-secondary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 signature-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary font-bold hover:underline text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
