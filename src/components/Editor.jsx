import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Codemirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/material.css";
import "codemirror/theme/nord.css";
import "codemirror/theme/gruvbox-dark.css";
import "codemirror/theme/night.css";
import "codemirror/theme/twilight.css";
import "codemirror/theme/oceanic-next.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";
import OutputModal from "./OutputModal";

const themes = [
  "dracula",
  "monokai",
  "solarized dark",
  "solarized light",
  "material",
  "nord",
  "gruvbox-dark",
  "night",
  "twilight",
  "oceanic-next",
];

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("dracula");

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: selectedTheme,
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
    setIsLoading(true);
    try {
      const code = editorRef.current.getValue();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/run-code`,
        {
          code,
        }
      );
      setIsSuccess(response.data.success);
      setOutput(response.data.output);
      setIsModalOpen(true);
    } catch (error) {
      setIsSuccess(false);
      setOutput(error.response ? error.response.data : error.message);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
    editorRef.current.setOption("theme", event.target.value);
  };

  return (
    <div className="editorContainer">
      <textarea id="realtimeEditor"></textarea>
      <div className="btnContainer">
        <button className="btn greenBtn" onClick={runCode}>
          Run
        </button>
        <select
          className="btn greenBtn"
          value={selectedTheme}
          onChange={handleThemeChange}
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
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
      {isModalOpen && (
        <OutputModal
          output={output}
          onClose={() => setIsModalOpen(false)}
          isSuccess={isSuccess}
        />
      )}
    </div>
  );
};

Editor.propTypes = {
  socketRef: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  onCodeChange: PropTypes.func.isRequired,
};

export default Editor;
