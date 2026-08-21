import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import authApi from "../../api/authApi";

import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";

function Profile() {
  const {
    user,
    updateUser,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleProfileChange = (event) => {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePasswordChange = (event) => {
    setPasswordForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    try {
      setProfileLoading(true);

      const response = await authApi.put("/profile", profileForm);

      updateUser(response.data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Profile update failed"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();

    if (passwordForm.new_password.length < 8) {
      toast.error("New password must contain at least 8 characters");
      return;
    }

    if (
      passwordForm.new_password !==
      passwordForm.confirm_password
    ) {
      toast.error("New password and confirmation do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await authApi.post("/change-password", {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });

      toast.success("Password updated successfully");

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Password update failed"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-green-800">
          YieldSense AI
        </h1>

        <Link
          to="/dashboard"
          className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        >
          Dashboard
        </Link>
      </nav>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900">
            My Profile
          </h2>

          <p className="mt-2 text-gray-600">
            Manage your account information.
          </p>

          {user && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-900">
              <p>
                <b>Email:</b> {user.email}
              </p>

              <p>
                <b>Role:</b> {user.role}
              </p>

              <p>
                <b>Status:</b>{" "}
                {user.is_verified ? "Verified" : "Not Verified"}
              </p>
            </div>
          )}

          <form
            onSubmit={handleUpdateProfile}
            className="mt-6 space-y-4"
          >
            <input
              name="full_name"
              placeholder="Full name"
              value={profileForm.full_name}
              onChange={handleProfileChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />

            <input
              name="phone"
              placeholder="Phone number"
              value={profileForm.phone}
              onChange={handleProfileChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />

            <Button type="submit" disabled={profileLoading}>
              {profileLoading
                ? "Updating Profile..."
                : "Update Profile"}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Change Password
          </h2>

          <p className="mt-2 text-gray-600">
            Enter your current password and choose a new password.
          </p>

          <form
            onSubmit={handleUpdatePassword}
            className="mt-6 space-y-4"
          >
            <input
              name="old_password"
              type="password"
              placeholder="Current password"
              value={passwordForm.old_password}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />

            <input
              name="new_password"
              type="password"
              placeholder="New password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />

            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading
                ? "Updating Password..."
                : "Update Password"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            Forgot your current password?{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-green-700"
            >
              Reset it here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Profile;