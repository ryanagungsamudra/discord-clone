"use client";

import axios from "axios";
import qs from "query-string";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { FileUploadDropzone } from "../file-upload-dropzone";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  fileUrl: z.string().optional(),
  //   fileUrl: z.string().min(1, {
  //     message: "Server image is required",
  //   }),
});

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  // Handle image upload
  const { toast } = useToast();
  const [rawImage, setRawImage] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: any) => {
    setRawImage(acceptedFiles);
  };

  const uploadFirebase = async () => {
    if (rawImage) {
      const imageRef = ref(
        storage,
        `/discord/serverImage/${rawImage[0]?.name}`
      );

      const task = uploadBytesResumable(imageRef, rawImage[0]);

      task.on("state_changed", (snapshot) => {
        // Calculate the progress percentage
        const newProgress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // Update the progress state only if it has changed
        if (newProgress !== progress) {
          setProgress(newProgress);
        }
      });

      try {
        await task;

        const downloadURL = await getDownloadURL(imageRef);
        console.log("File uploaded successfully. Download URL:", downloadURL);

        // Set the fileUrl field in the form
        form.setValue("fileUrl", downloadURL, { shouldValidate: false });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await uploadFirebase();

    // Get the fileUrl value from the form after uploadFirebase has completed
    const fileUrl = form.getValues("fileUrl");

    // Set the fileUrl in the values object
    values.fileUrl = fileUrl;

    try {
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      await axios.post(url, {
        ...values,
        content: values.fileUrl,
      });

      toast({
        variant: "success",
        title: "Success upload file",
        description: "Your file has been uploaded successfully!",
      });

      router.refresh();
      setProgress(0);
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FileUploadDropzone onDrop={onDrop} />
              </div>

              <FormMessage>
                {form.formState.errors.fileUrl?.message}
              </FormMessage>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4 items-center">
              {progress > 0 ? (
                <>
                  <Progress value={progress} className="mr-0 w-full" />
                  <p className="ml-4">{progress}%</p>
                </>
              ) : (
                <Button type="submit" variant={"primary"} disabled={isLoading}>
                  Send
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
