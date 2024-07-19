import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Codemirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import axios from "axios";
import { useState } from "react";
const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit("code-change", {
            roomId,
            code,
          });
        }
      });
    }

    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off("code-change");
    };
  }, [socketRef.current]);

  const runCode = async () => {
    try {
      const code = editorRef.current.getValue();
      const response = await axios.post("http://localhost:3000/run-code", {
        code,
      });
      console.log(response.data);
      setOutput(response.data);
    } catch (error) {
      setOutput(error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <textarea id="realtimeEditor"></textarea>
      <div className=" btnContainer">
        <button className="btn runBtn" onClick={runCode}>
          Run
        </button>
        <button className="btn outputBtn" onClick={runCode}>
          Output
        </button>
      </div>
    </div>
  );
};

Editor.propTypes = {
  socketRef: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  onCodeChange: PropTypes.func.isRequired,
};
export default Editor;
