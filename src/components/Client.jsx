import Avatar from "react-avatar";
import PropTypes from "prop-types";
const Client = ({ username }) => {
  // console.log("username from client", username);
  return (
    <div className="client">
      <Avatar name={username} size={50} round="14px" color="#4aed88" />
      <span className="userName">{username}</span>
    </div>
  );
};

Client.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Client;
