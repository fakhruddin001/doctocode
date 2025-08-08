"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import CustomSelect from "./Components/CustomSelect";
import UploadFileInput from "./Components/UploadFileInput";
import axios from "axios";
import CodeTypingAnimation from "./Components/CodeTypingAnimation";
import LoadingButton from "./Components/LoadingButton";

const Hero = () => {
  const [selectedLanguage, setSelectedLanguageState] = useState("");
  const [projectName, setProjectNameState] = useState("");
  const [file1, setFile1State] = useState<File | null>(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [projectGenerated, setProjectGenerated] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [errors, setErrors] = useState<{
    language?: string;
    name?: string;
    file1?: string;
  }>({});

  // Watchers to clear errors when value is set
  const setSelectedLanguage = (value: string) => {
    setSelectedLanguageState(value);
    if (value && errors.language) {
      setErrors((prev) => ({ ...prev, language: undefined }));
    }
  };
  const setProjectName = (value: string) => {
    setProjectNameState(value);
    if (value.trim() && errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };
  const setFile1 = (file: File | null) => {
    setFile1State(file);
    if (file && errors.file1) {
      setErrors((prev) => ({ ...prev, file1: undefined }));
    }
  };

  const handleGenerateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;
    const newErrors: {
      language?: string;
      name?: string;
      file1?: string;
    } = {};
    if (!selectedLanguage) {
      newErrors.language = "Please select a language.";
      valid = false;
    }
    if (!projectName.trim()) {
      newErrors.name = "Project name is required.";
      valid = false;
    }
    if (!file1) {
      newErrors.file1 = "PCD file is required.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    // Check isLoggedIn in localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn || isLoggedIn === "false") {
      // Open login popup instead of generating the project
      if (typeof window !== "undefined") {
        // Try to trigger the login modal if available
        const loginEvent = new CustomEvent("open-login-modal");
        window.dispatchEvent(loginEvent);
      }
      return;
    }

    setLoadingGenerate(true);
    setFormSubmitted(false);
    setProjectGenerated(false);

    const formData = new FormData();
    file1 && formData.append("docFile", file1);

    try {
      const response = await axios.post(
        `${apiUrl}Builder?ProjectName=${projectName}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      await handleDownloadProject();
      setLoadingGenerate(false);
      setFormSubmitted(true);
      setProjectGenerated(true);
      setShowSuccessModal(true);
      window.sessionStorage.setItem("projectKey", response.data);
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDownloadProject = async () => {
    setLoadingDownload(true);
    const savedPath = `Download/folder?folderPath=C:\\Data\\${projectName}`;
    const response = await axios.get(`${apiUrl}${savedPath}`, {
      responseType: "blob",
    });

    const fileName = projectName;
    // Create a temporary anchor element to trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the temporary anchor element and URL
    link?.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    setLoadingDownload(false);
  };

  return (
    <section
      id="home-section"
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 relative"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/banner/bg-light-6.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Decorative Accent */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary/10 to-blue-200/10 blur-2xl z-0 pointer-events-none" />
      {/* Main Section */}

      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-2 pt-36 pb-10 flex-1 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Illustration & Slogan */}
          <div className="col-span-6 flex flex-col items-center justify-center">
            <div className="w-full flex justify-center mb-8">
              <div className="relative group">
                <AnimatePresence>
                  {loadingGenerate ? (
                    <motion.div className="relative w-[450px] h-[450px] flex items-center justify-center">
                      {/* Original image that transforms */}
                      <motion.div
                        className="absolute"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{
                          scale: [1, 0.8, 0.2],
                          opacity: [1, 0.8, 0],
                          y: [0, -20, -40],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                      >
                        <Image
                          src="/images/banner/banner-image.jpg"
                          alt="Document to Code Illustration"
                          width={420}
                          height={220}
                          className="rounded-3xl shadow-2xl object-cover bg-gray-100 border-4 border-white"
                          onError={(e) => {
                            e.currentTarget.src = "/images/logo/logo.svg";
                          }}
                          priority
                        />
                      </motion.div>

                      {/* Transformation effect */}
                      <motion.div
                        className="absolute"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [0, 1, 1, 0],
                          rotate: [0, 0, 360, 360],
                        }}
                        transition={{
                          duration: 2,
                          times: [0, 0.3, 0.7, 1],
                          ease: "easeInOut",
                        }}
                      >
                        <div className="text-6xl">⚡</div>
                      </motion.div>

                      {/* Code editor that appears - FIXED SIZE */}
                      <motion.div
                        className="absolute inset-0 flex flex-col justify-center items-center"
                        initial={{ scale: 0, opacity: 0, y: 40 }}
                        animate={{
                          scale: [0, 0, 1.1, 1],
                          opacity: [0, 0, 1, 1],
                          y: [40, 40, 0, 0],
                        }}
                        transition={{
                          duration: 2,
                          times: [0, 0.5, 0.8, 1],
                          ease: "easeOut",
                        }}
                      >
                        {/* Code editor*/}
                        <div className="bg-gray-900 rounded-3xl shadow-2xl border-4 border-white p-4 w-[420px] h-[400px] relative overflow-hidden">
                          {/* Editor header */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="text-gray-400 text-xs font-mono">
                              main.cs
                            </div>
                          </div>

                          {/* Code content with typing effect */}
                          <div className="h-[calc(100%-3rem)] overflow-hidden">
                            {/* Adjusted height calculation to account for header and padding */}
                            <CodeTypingAnimation
                              isCsharp={selectedLanguage == "C#" ? true : false}
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Loading dots */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3, duration: 0.5 }}
                        className="absolute -bottom-6 flex space-x-2"
                      >
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-3 h-3 bg-blue-500 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group"
                    >
                      <Image
                        src="/images/banner/banner-image.jpg"
                        alt="Document to Code Illustration"
                        width={420}
                        height={220}
                        className="rounded-3xl shadow-2xl transition-transform duration-300 group-hover:scale-105 object-cover bg-gray-100 border-4 border-white"
                        onError={(e) => {
                          e.currentTarget.src = "/images/logo/logo.svg";
                        }}
                        priority
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-60 blur-sm" />
              </div>
            </div>

            <p className="text-black/70 text-xl font-semibold text-center mb-4 drop-shadow-sm">
              Transform your documentation into
              <br />
              <span className="text-primary font-extrabold">
                production-ready code
              </span>{" "}
              in seconds.
            </p>
          </div>

          {/* Form Card */}
          <div className="col-span-6 flex items-center justify-center">
            <form
              className="w-full max-w-lg flex flex-col gap-6 bg-white/95 p-12 rounded-3xl shadow-[0_8px_40px_0_rgba(0,0,0,0.10)] border border-gray-100 backdrop-blur-md"
              onSubmit={handleGenerateProject}
              aria-label="Project Generation Form"
            >
              <h1 className="text-4xl lg:text-4xl font-extrabold mb-6 text-primary text-center drop-shadow-lg tracking-tight">
                Docs In, <span className="text-blue-500">Code Out.</span>
              </h1>
              <div className="relative w-full">
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="border w-full h-12 border-primary rounded-xl text-primary font-medium py-3 px-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm pr-10"
                    placeholder="Enter your project name"
                    autoComplete="off"
                    aria-label="Project Name"
                  />
                  <span className="absolute right-3 text-gray-400">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9V7a5 5 0 0110 0v2M12 14v2m0 0h.01" />
                    </svg>
                  </span>
                </div>
                <span className="text-red-500 text-xs mt-1 min-h-[20px] block">
                  {errors.name || "\u00A0"}
                </span>
              </div>
              {/* Language & Project Name */}
              <div className="flex flex-col gap-5">
                <div className="relative w-full">
                  <CustomSelect
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    aria-label="Select Language"
                  />
                  <span className="text-red-500 text-xs mt-1 min-h-[20px] block">
                    {errors.language || "\u00A0"}
                  </span>
                </div>
                {/* File Uploads */}
                <div className="flex flex-col gap-8 mt-2">
                  <div className="flex flex-row gap-6 items-center justify-center">
                    <div className="flex flex-col relative w-full">
                      <UploadFileInput
                        label={file1 ? file1.name : "Upload PCD File"}
                        inputClassName="w-full h-12 rounded-xl"
                        onChange={(e) => setFile1(e.target.files?.[0] || null)}
                        aria-label="Upload PCD File"
                      />
                      {/* Info icon removed for cleaner UI */}
                      <span className="text-red-500 text-xs mt-1 min-h-[20px] block">
                        {errors.file1 || "\u00A0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-4 items-center justify-center mt-5">
                <LoadingButton
                  type="submit"
                  loading={loadingGenerate}
                  loadingText="Generating"
                  className="ml-2 flex items-center"
                >
                  Generate & Download Project
                </LoadingButton>
                {/* <LoadingButton
                  type="button"
                  buttonColor="grey"
                  disabled={!projectGenerated || loadingDownload}
                  loadingText="Downloading"
                  className={`ml-2 flex items-center ${
                    projectGenerated
                      ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:text-white"
                      : "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                  }`}
                  onClick={handleDownloadProject}
                >
                  Download Project
                </LoadingButton> */}
              </div>

              {/* Success Modal Popup */}
              {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
                    onClick={() => setShowSuccessModal(false)}
                  ></div>
                  <div
                    className="relative bg-white rounded-2xl shadow-2xl border-2 border-primary flex flex-col items-center px-12 py-12 animate-[pop_0.3s_ease]"
                    style={{ zIndex: 51 }}
                  >
                    <svg
                      className="w-16 h-16 text-primary mb-4 drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div className="text-primary text-center font-bold text-2xl mb-4 drop-shadow">
                      Project generated successfully!
                    </div>
                    <button
                      className="mt-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-primary-900 transition-colors"
                      onClick={() => setShowSuccessModal(false)}
                    >
                      Close
                    </button>
                  </div>
                  <style>{`
                    @keyframes pop {
                      0% { transform: scale(0.7); opacity: 0; }
                      80% { transform: scale(1.05); opacity: 1; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                  `}</style>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer / Tip Section */}
      <footer className="w-full text-center py-6 bg-white/30 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6 border-t border-gray-200 mt-auto shadow-inner">
        <span className="text-gray-500 text-sm">
          <span className="font-medium text-primary">Tip:</span> You can always
          download your generated project after signing in. &nbsp;|&nbsp;{" "}
          <span className="font-semibold">Version 1.0.0</span>
        </span>
      </footer>
    </section>
  );
};

export default Hero;
