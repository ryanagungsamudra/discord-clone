'use client'

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export const FileUploadDropzone = ({ onDrop }: FileUploadProps) => {
    const [filePreview, setFilePreview] = useState<string | null>(null);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    }
  });

   useEffect(() => {
    // Load and display the first selected image as a preview
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [acceptedFiles]);


  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
        isDragActive ? "border-primary" : "border-zinc-300"
      }`}
    >
      <input {...getInputProps()} />
      {filePreview ? (
        <img src={filePreview} alt="File Preview" className="max-w-full max-h-40" />
      ) : (
        <p className="text-zinc-500 dark:text-secondary/70">
          {isDragActive
            ? "Drop the file here ..."
            : "Drag 'n' drop an image file here, or click to select one"}
        </p>
      )}
    </div>
  );
};