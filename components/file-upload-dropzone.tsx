"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onDrop: (acceptedFiles: File[]) => void;
  imageUrl?: string;
}

export const FileUploadDropzone = ({ onDrop, imageUrl }: FileUploadProps) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [],
      },
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
    } else if (imageUrl) {
      setFilePreview(imageUrl);
    } else {
      setFilePreview(null);
    }
  }, [acceptedFiles, imageUrl]);

  return (
    <div
      {...getRootProps()}
      className={`border-[2px] border-dashed rounded-lg p-4 text-center cursor-pointer mx-[5.5rem] ${
        isDragActive ? "border-primary" : "border-zinc-300"
      }`}>
      <input {...getInputProps()} />
      {filePreview !== null ? (
        <Image
          src={filePreview}
          alt="File Preview"
          width={200}
          height={200}
          // className="max-w-40 max-h-40 rounded-full"
          className="w-40 h-40 rounded-full object-cover"
        />
      ) : (
        <>
          <p className="text-zinc-500 dark:text-secondary/70">
            <div className="flex w-full justify-center mb-4">
              <Image
                src={require("@/app/assets/upload.png")}
                alt="Upload Icon"
                width={100}
                height={100}
              />
            </div>
            {isDragActive
              ? "Drop the file here ..."
              : "Drag & drop an image file here, or click to select one"}
          </p>
        </>
      )}
    </div>
  );
};
