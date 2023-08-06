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

  console.log('ERR RES OBJ: ', errors);

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          />
        </label>
        {errors.credential &&
          errors.credential === 'Please provide a valid email or username.' &&

          <p>{errors.credential}</p>
        }
        <label>
          Password
          <input
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

          <p>{errors.credential}</p>
        }
        <button type="submit">Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;
