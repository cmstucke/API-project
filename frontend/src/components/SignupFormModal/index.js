import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password,
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  console.log('SIGNUP ERR OBJ: ', errors);

  return (
    <div className="modal-form-body">
      <h1 className="modal-heading">Sign Up</h1>
      <form
        className="modal-form"
        onSubmit={handleSubmit}
      >
        <label className="modal-input-container">
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {errors.email && <p className="errors">The provided email is invalid</p>}
        <label className="modal-input-container">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        {errors.username && <p className="errors">Username must be unique</p>}
        <label className="modal-input-container">
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        {errors.firstName && <p className="errors">{errors.firstName}</p>}
        <label className="modal-input-container">
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        {errors.lastName && <p className="errors">{errors.lastName}</p>}
        <label className="modal-input-container">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {errors.password && <p className="errors">{errors.password}</p>}
        <label className="modal-input-container">
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {errors.confirmPassword && (
          <p className="errors">{errors.confirmPassword}</p>
        )}
        {/* <button type="submit">Sign Up</button> */}
        <button
          className='modal-submit'
          type="submit"
          disabled={
            username.length < 4 ||
            password.length < 6
          }
        >Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;
