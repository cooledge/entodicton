import React, { useState, useRef, useEffect } from 'react';
import './css/InputWithDropdown.css';

const InputWithDropdown = (props) => {
  const { options, disabled } = props
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      // Small delay helps when the input was just re-enabled
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }, [disabled]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    inputRef.current.focus()
  };

  const handleOptionClick = (option) => {
    document.getElementById('query').value = option
    props.onKeyDown({ key: 'Enter' })
    setInputValue(option);
    setIsOpen(false);
    inputRef.current.focus()
  };

  const onKeyDown = (e) => {
    setIsOpen(false);
    props.onKeyDown(e)
  };

  return (
    <span className="input-dropdown-wrapper" ref={wrapperRef}>
      <input
        type="text"
        id={props.id}
        autoFocus={props.autoFocus}
        onKeyDown={onKeyDown}
        className={`${props.className}`}
        placeholder="Type and press enter to submit or click to select an option."
        autoComplete="off"
        onClick={() => setIsOpen(true)}
        ref={inputRef}
        disabled={disabled}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="dropdown-list">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className="dropdown-item"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
};

export default InputWithDropdown;
