"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Layout/Header/Logo"
import Loader from "@/components/Common/Loader";

interface SigninProps {
  onClose: () => void;
}

const Signin = ({ onClose }: SigninProps) => {
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    checkboxToggle: false,
  });
  const [loading, setLoading] = useState(false);

  const loginUser = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const hardcodedEmail = "fakhruddin.n@bureauveritas.com";
    const hardcodedPassword = "password123";
    console.log("Entered email:", loginData.email);
    console.log("Entered password:", loginData.password);
    setTimeout(() => {
      if (
        loginData.email === hardcodedEmail &&
        loginData.password === hardcodedPassword
      ) {
        console.log("Login successful, setting isLoggedIn and closing popup");
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true");
        }
        toast.success("Login successful");
        setLoading(false);
        if (onClose) onClose();
        router.refresh();
      } else {
        console.log("Invalid credentials");
        toast.error("Invalid credentials");
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block">
        <Logo />
      </div>

      <form onSubmit={loginUser} style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        <div className="mb-[22px]">
          <input
            type="email"
            placeholder="Email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className="w-full rounded-lg border border-blue-100 bg-white/95 px-5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary focus:bg-white focus:text-gray-900"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full rounded-lg border border-blue-100 bg-white/95 px-5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary focus:bg-white focus:text-gray-900"
          />
        </div>
        <div className="mb-9">
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-blue-400 w-full py-3 rounded-xl text-lg font-semibold border-none text-white hover:from-white hover:to-white hover:text-primary transition-all duration-200 shadow-lg focus:ring-2 focus:ring-primary flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader /> : 'Sign In'}
          </button>
        </div>
      </form>

      <Link
        href="#"
        className="mb-2 inline-block text-blue-500 hover:text-primary transition-colors duration-200"
      >
        Forgot Password?
      </Link>
      <p className="text-body-secondary text-gray text-base">
        <span className="text-gray-700">Not a member yet?</span>{" "}
        <Link href="#" className="text-blue-500 hover:text-primary underline transition-colors duration-200">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default Signin;