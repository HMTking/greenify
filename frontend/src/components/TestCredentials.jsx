import { useState } from "react";

const TestCredentials = ({ onFillCredentials }) => {
  const [message, setMessage] = useState("");

  const fillCredentials = (email, password, type) => {
    onFillCredentials(email, password);
    setMessage(`${type} credentials filled!`);
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="test-credentials">
      <h4>🔧 Test Login Credentials</h4>

      {message && (
        <div
          className="auth-alert auth-alert-success"
          style={{ marginBottom: "1rem" }}
        >
          {message}
        </div>
      )}

      <div className="credentials-section">
        <strong>🔧 Admin Account:</strong>
        <div className="credential-item">Email: admin@gmail.com</div>
        <div className="credential-item">Password: AdminPlant@123</div>
        <button
          type="button"
          className="copy-credential-btn"
          onClick={() =>
            fillCredentials("admin@gmail.com", "AdminPlant@123", "Admin")
          }
          title="Fill admin credentials in the form"
        >
          Try Admin
        </button>
      </div>

      <div className="credentials-section">
        <strong>👤 Customer Account:</strong>
        <div className="credential-item">Email: customer@gmail.com</div>
        <div className="credential-item">Password: PlantLover@456</div>
        <button
          type="button"
          className="copy-credential-btn"
          onClick={() =>
            fillCredentials("customer@gmail.com", "PlantLover@456", "Customer")
          }
          title="Fill customer credentials in the form"
        >
          Try Customer
        </button>
      </div>

      <p className="test-note">
        Note: You can also create your own account via registration
      </p>
    </div>
  );
};

export default TestCredentials;
