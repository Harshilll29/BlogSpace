import React from "react";
import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon, disable = false }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        id={id}
        disabled={disable}
        className="input-box pl-12 pr-12" // <-- add padding for icons
      />
      {type === "password" && (
        <>
          {/* Key icon always on the left */}
          <i
            className={
              "fi " +
              icon +
              " input-icon absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            }
          />
          {/* Eye icon on the right, only if not empty */}
          {inputValue !== "" && (
            <i
              className={
                "fi fi-rr-eye" +
                (!passwordVisible ? "-crossed" : "") +
                " input-icon absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              }
              onClick={() => setPasswordVisible((currentVal) => !currentVal)}
            ></i>
          )}
        </>
      )}
      {type !== "password" && (
        <i
          className={
            "fi " +
            icon +
            " input-icon absolute left-4 top-1/2 -translate-y-1/2"
          }
        />
      )}
    </div>
  );
};

export default InputBox;
