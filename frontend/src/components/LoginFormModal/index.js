import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          console.log(data.errors);
          setErrors(data.errors);
        }
      });
  };

  const handleDemo = (e) => {
    e.preventDefault();
    // setErrors({});
    return dispatch(sessionActions.login({
      credential: 'Demo User',
      password: 'password'
    })).then(closeModal)
    // .catch(async (res) => {
    //   const data = await res.json();
    //   if (data && data.errors) {
    //     console.log(data.errors);
    //     setErrors(data.errors);
    //   }
    // });
  };

  return (
    <div id="modal-form-body">
      <h1 id="login-modal-heading">Log In</h1>
      <form id='form' onSubmit={handleSubmit}>
        <label className="input-container">
          Username or Email
          <input
            className="input"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          />
        </label>
        {errors.credential &&
          errors.credential === 'Please provide a valid email or username.' &&

          <p className="errors">{errors.credential}</p>
        }
        <label className="input-container">
          Password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {errors.password && (
          <p>{errors.password}</p>
        )}
        {errors.credential &&
          errors.credential === 'The provided credentials were invalid.' &&

          <p className="errors">{errors.credential}</p>
        }
        <button
          id='log-in'
          type="submit"
          onClick={handleDemo}
        >Log in as Demo User</button>
        <button
          id='log-in'
          type="submit"
          disabled={
            credential.length < 4 ||
            password.length < 6
          }
        >Log In</button>
      </form>
    </div>
  );
}

export default LoginFormModal;
