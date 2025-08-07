"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import Image from "next/image";
import HeaderLink from "../Header/Navigation/HeaderLink";
import MobileHeaderLink from "../Header/Navigation/MobileHeaderLink";
import Signin from "@/components/Auth/SignIn";
import { Icon } from "@iconify/react/dist/iconify.js";

const Header: React.FC = () => {

  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  const navbarRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setSticky(window.scrollY >= 20);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      signInRef.current &&
      !signInRef.current.contains(event.target as Node)
    ) {
      setIsSignInOpen(false);
    }
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    // Listen for custom event to open Sign In modal from anywhere
    const handleOpenLoginModal = () => setIsSignInOpen(true);
    window.addEventListener("open-login-modal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, [navbarOpen, isSignInOpen]);

  useEffect(() => {
    if (isSignInOpen  || navbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isSignInOpen, navbarOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-white py-2 transition-all duration-300 ease-in-out ${
        sticky ? "bg-white/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
      ref={navbarRef}
      style={{
        boxShadow: sticky ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none",
        borderBottom: "1px solid transparent" /* Or desired thickness */,
        borderImage:
          "linear-gradient(to right, transparent, gray, transparent) 2",
        /* Adjust colors and direction as needed */
      }}
    >
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md flex items-center justify-between px-4 rounded-lg min-h-[52px] relative">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        {/* App Name Absolutely Centered (Desktop Only) */}
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span className="text-3xl font-extrabold text-primary tracking-wider drop-shadow-md uppercase">
            <Image
              src="/images/logo/codient-logo.png"
              alt="Document to Code Illustration"
              width={250}
              height={50}
              className="rounded-3xl shadow-2xl object-cover bg-gray-100 border-4 border-white"
              onError={(e) => {
                e.currentTarget.src = "/images/logo/logo.svg";
              }}
              priority
            />
          </span>
        </div>
        <nav className="hidden lg:flex flex-grow items-center gap-8 justify-center">
          {headerData.map((item, index) => (
            <HeaderLink key={index} item={item} />
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {/* Action buttons and modals here */}
          <Link
            href="#"
            className="hidden lg:block font-semibold text-lg py-2 px-8 rounded-full shadow-lg border border-primary bg-primary text-white relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{ boxShadow: "0 2px 16px 0 rgba(34,197,94,0.10)" }}
            onClick={() => {
              setIsSignInOpen(true);
            }}
            aria-label="Sign In"
          >
            <span className="relative z-10 drop-shadow">Login</span>
          </Link>
          {isSignInOpen && (
            <div className="fixed inset-0 w-full min-h-screen bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div
                ref={signInRef}
                className="w-full max-w-md overflow-hidden rounded-2xl px-10 py-10 text-center bg-white/90 backdrop-blur-xl shadow-2xl border border-primary transition-transform duration-200 hover:scale-105"
                style={{
                  minHeight: "340px",
                  border: "1.5px solid #bae6fd",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.20)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                }}
              >
                <button
                  onClick={() => setIsSignInOpen(false)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg border border-blue-200 hover:bg-blue-100 hover:text-primary transition-colors duration-200 flex items-center justify-center"
                  aria-label="Close Sign In Modal"
                >
                  <Icon
                    icon="tabler:currency-xrp"
                    className="text-black hover:text-primary text-2xl inline-block me-2"
                  />
                </button>
                <div className="mt-6">
                  <Signin onClose={() => setIsSignInOpen(false)} />
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="block lg:hidden p-2 rounded-lg bg-primary text-white shadow-md"
            aria-label="Toggle mobile menu"
          >
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white mt-1.5"></span>
            <span className="block w-6 h-0.5 bg-white mt-1.5"></span>
          </button>
        </div>
      </div>
      {navbarOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" />
      )}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-full bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs ${
          navbarOpen ? "translate-x-0" : "translate-x-full"
        } z-50 rounded-l-xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-midnight_text dark:text-midnight_text">
            <Logo />
          </h2>
          <button
            onClick={() => setNavbarOpen(false)}
            className="bg-[url('/images/closed.svg')] bg-no-repeat bg-contain w-5 h-5 absolute top-0 right-0 mr-8 mt-8 dark:invert"
            aria-label="Close menu Modal"
          ></button>
        </div>
        <nav className="flex flex-col items-start p-4">
          {headerData.map((item, index) => (
            <MobileHeaderLink key={index} item={item} />
          ))}
          <div className="mt-4 flex flex-col space-y-4 w-full">
            <Link
              href="#"
              className="bg-white border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white shadow-sm transition-colors duration-200"
              onClick={() => {
                setIsSignInOpen(true);
                setNavbarOpen(false);
              }}
            >
              Sign In
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
