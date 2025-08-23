import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  // Separate forms for each section
  const profileForm = useForm();
  const passwordForm = useForm();
  const addressForm = useForm();

  // Loading states for each section
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Message states for each section
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      // Set profile form values
      profileForm.setValue("name", user.name || "");

      // Set address form values
      addressForm.setValue("street", user.address?.street || "");
      addressForm.setValue("city", user.address?.city || "");
      addressForm.setValue("state", user.address?.state || "");
      addressForm.setValue("zipCode", user.address?.zipCode || "");
      addressForm.setValue("phone", user.address?.phone || "");
    }
  }, [user]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (profileMessage) {
      const timer = setTimeout(() => setProfileMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage]);

  useEffect(() => {
    if (passwordMessage) {
      const timer = setTimeout(() => setPasswordMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  useEffect(() => {
    if (addressMessage) {
      const timer = setTimeout(() => setAddressMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [addressMessage]);

  // Handle profile name update
  const onUpdateProfile = async (data) => {
    setLoadingProfile(true);
    setError("");
    setProfileMessage("");

    try {
      const result = await updateProfile({ name: data.name });
      if (result.success) {
        setProfileMessage("Name updated successfully!");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update name");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle password change
  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setLoadingPassword(true);
    setError("");
    setPasswordMessage("");

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      );

      if (response.data.success) {
        setPasswordMessage("Password changed successfully!");
        passwordForm.reset();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoadingPassword(false);
    }
  };

  // Handle address update
  const onUpdateAddress = async (data) => {
    setLoadingAddress(true);
    setError("");
    setAddressMessage("");

    try {
      const result = await updateProfile({ address: data });
      if (result.success) {
        setAddressMessage("Address updated successfully!");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update address");
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Edit Profile</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Profile Name Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">Profile Information</h2>
            {profileMessage && (
              <div className="success-message">{profileMessage}</div>
            )}
          </div>
          <form
            className="section-form"
            onSubmit={profileForm.handleSubmit(onUpdateProfile)}
          >
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                {...profileForm.register("name", {
                  required: "Name is required",
                })}
              />
              {profileForm.formState.errors.name && (
                <div className="form-error">
                  {profileForm.formState.errors.name.message}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input disabled"
                value={user?.email || ""}
                disabled
              />
              <small className="form-help">Email cannot be changed</small>
            </div>
            <button
              type="submit"
              className="btn btn-update"
              disabled={loadingProfile}
            >
              {loadingProfile ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">Change Password</h2>
            {passwordMessage && (
              <div className="success-message">{passwordMessage}</div>
            )}
          </div>
          <form
            className="section-form"
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
          >
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                {...passwordForm.register("currentPassword", {
                  required: "Current password is required",
                })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <div className="form-error">
                  {passwordForm.formState.errors.currentPassword.message}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                {...passwordForm.register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <div className="form-error">
                  {passwordForm.formState.errors.newPassword.message}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                {...passwordForm.register("confirmPassword", {
                  required: "Please confirm your new password",
                })}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <div className="form-error">
                  {passwordForm.formState.errors.confirmPassword.message}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-update"
              disabled={loadingPassword}
            >
              {loadingPassword ? "Changing..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Address Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">Delivery Address</h2>
            {addressMessage && (
              <div className="success-message">{addressMessage}</div>
            )}
          </div>
          <form
            className="section-form"
            onSubmit={addressForm.handleSubmit(onUpdateAddress)}
          >
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your street address"
                {...addressForm.register("street")}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="City"
                  {...addressForm.register("city")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="State"
                  {...addressForm.register("state")}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ZIP Code"
                  {...addressForm.register("zipCode")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Phone number"
                  {...addressForm.register("phone")}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-update"
              disabled={loadingAddress}
            >
              {loadingAddress ? "Updating..." : "Update Address"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
