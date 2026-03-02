import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from "axios";

export default function Login() {
  const [params] = useSearchParams();
  const isHosp = params.get('role') === 'hospital';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const res = await axios.post(
        "https://mediintake-fullstack.onrender.com/api/auth/login",
        {
          email: form.email,
          password: form.password
        }
      );

      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "patient") {
        navigate("/patient/dashboard");
      } else {
        navigate("/hospital/queue");
      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Login failed. Check email/password."
      );

    } finally {
      setLoading(false);
    }
  };