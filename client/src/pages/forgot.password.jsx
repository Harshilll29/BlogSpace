import { useState } from "react";
import { toast } from "react-hot-toast";

const ForgotPassword = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_DOMAIN + "/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success("OTP sent to your email");
      onOtpSent(email); // Pass the email to the next step
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    }
  };

  return (
    <div className="h-cover flex items-center justify-center">
      <form className="w-[80%] max-w-[400px]" onSubmit={handleSendOtp}>
        <h2 className="text-4xl font-gelasio capitalize text-center mb-12">
          Forgot Password
        </h2>
        <div className="relative">
          <i className="fi fi-rr-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="email"
            placeholder="Enter your email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="btn-dark center mt-16" type="submit">
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
