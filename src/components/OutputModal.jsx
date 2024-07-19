import PropTypes from "prop-types";

const OutputModal = ({ output, onClose, isSuccess }) => {
  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="modalHeader">
          <button className="closeBtn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modalBody">
          <pre
            style={{ color: isSuccess ? "#32CD32" : "red", fontSize: "1.5em" }}
          >
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
};

OutputModal.propTypes = {
  output: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isSuccess: PropTypes.bool.isRequired,
};

export default OutputModal;
