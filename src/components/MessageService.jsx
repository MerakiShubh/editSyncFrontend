import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";

const MessageService = ({ onClose }) => {
  const [phoneNo, setPhoneNo] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+91 \d{5} \d{5}$/;
    return phoneRegex.test(phone);
  };

  const sendSms = async () => {
    console.log("sendSms function called");
    console.log("Phone No:", phoneNo);
    console.log("Message:", message);

    if (!phoneNo || !message) {
      toast.error("Phone number and message are required");
      return;
    }

    if (!validatePhoneNumber(phoneNo)) {
      toast.error(
        "Not a valid phone number. Please enter in the format '+91 81045 5****'."
      );
      return;
    }

    setIsLoading(true); // Set loading to true

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send-sms`,
        {
          phoneNo,
          message,
        }
      );
      if (response.data.success) {
        toast.success("Message sent successfully");
        onClose();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending SMS:", error);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  const handleInputEnter = (e) => {
    console.log("Key pressed:", e.code);
    if (e.code === "Enter") {
      sendSms();
    }
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="modalOverlay">
      <div className="formWrapper" ref={modalRef}>
        <img src="/code-sync.png" alt="" className="homePageLogo" />
        <h4 className="mainLabel">Send Room ID to Phone Number</h4>
        <div className="inputGroup">
          <input
            value={phoneNo}
            type="text"
            className="inputBox"
            placeholder="Phone Number"
            onChange={(e) => {
              setPhoneNo(e.target.value);
              console.log("Phone No changed:", e.target.value);
            }}
            onKeyUp={handleInputEnter}
          />
          <input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              console.log("Message changed:", e.target.value);
            }}
            type="text"
            className="inputBox"
            placeholder="Message"
            onKeyUp={handleInputEnter}
          />
          <button
            className="btn joinBtn"
            onClick={sendSms}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
        {isLoading && (
          <div className="spinnerOverlay">
            <TailSpin
              height={80}
              width={80}
              color="#4aed88"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass="spinner"
              visible={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

MessageService.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MessageService;
