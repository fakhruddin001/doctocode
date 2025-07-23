import React from "react";

interface UploadFileInputProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  inputClassName?: string;
}


const UploadFileInput: React.FC<UploadFileInputProps> = ({ onChange, label, inputClassName }) => {
  const [loading, setLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Simulate loading (replace with actual upload logic if needed)
      setTimeout(() => {
        setFileName(selectedFile.name);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
      setFileName(null);
    }
    if (onChange) onChange(e);
  };

  return (
    <div className="flex flex-col items-start">
      <label className={`relative ${inputClassName || 'w-52 h-12 rounded-xl'}`}>
        <input
          type="file"
          onChange={handleChange}
          className="sr-only"
        />
        <div className={`flex items-center justify-center w-full h-full px-4 py-2 bg-primary text-white dark:bg-primary rounded-xl shadow cursor-pointer hover:bg-primary/80 transition-colors border-2 border-primary dark:border-primary`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12l8-8 8 8M12 4v12" />
          </svg>
          {loading ? (
            <span className="text-sm font-medium animate-pulse">Loading...</span>
          ) : (
            <span className="text-sm font-medium">{fileName || label || "Choose file"}</span>
          )}
        </div>
      </label>
    </div>
  );
};

export default UploadFileInput;
