"use client";

import axios from "axios";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { FileUploadDropzone } from "../file-upload-dropzone";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required",
  }),
  imageUrl: z.string().optional(),
  //   imageUrl: z.string().min(1, {
  //     message: "Server image is required",
  //   }),
});

export const InitialModal = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Handle image upload
  const { toast } = useToast();
  const [rawImage, setRawImage] = useState(null);
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

        // Set the imageUrl field in the form
        form.setValue("imageUrl", downloadURL, { shouldValidate: false });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await uploadFirebase();

    // Get the imageUrl value from the form after uploadFirebase has completed
    const imageUrl = form.getValues("imageUrl");

    // Set the imageUrl in the values object
    values.imageUrl = imageUrl;

    try {
      await axios.post("/api/servers", values);
      toast({
        variant: "success",
        title: "Success create server",
        description: "Your server has been created successfully!",
      });
      form.reset();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  //   const onSubmit = async (values: z.infer<typeof formSchema>) => {
  //     if (rawImage) {
  //       const imageRef = ref(
  //         storage,
  //         `/discord/serverImage/${rawImage[0]?.name}`
  //       );

  //       const task = uploadBytesResumable(imageRef, rawImage[0]);

  //       task.on("state_changed", (snapshot) => {
  //         // Calculate the progress percentage
  //         const newProgress = Math.round(
  //           (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  //         );

  //         // Update the progress state only if it has changed
  //         if (newProgress !== progress) {
  //           setProgress(newProgress);
  //         }
  //       });

  //       try {
  //         await task;

  //         const downloadURL = await getDownloadURL(imageRef)
  //         console.log("File uploaded successfully. Download URL:", downloadURL);

  //         form.setValue("imageUrl", downloadURL);
  //         console.log({ values });

  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }

  //     try {
  //         await axios.post("/api/servers", values)
  //         toast({
  //          variant: "success",
  //           title: "Success create server",
  //           description: "Your server has been created successfully!",
  //         })
  //         form.reset()
  //         router.refresh()
  //         window.location.reload()
  //     } catch (error){
  //         console.log(error)
  //     }
  //   };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give yout server a personality with a name and an image. You can
            always change these later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FileUploadDropzone onDrop={onDrop} />
                {/* <FormField 
                                    control={form.control}
                                    name="imageUrl"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload 
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>

                                        </FormItem>
                                    )}
                                /> */}
              </div>

              <FormMessage>
                {form.formState.errors.imageUrl?.message}
              </FormMessage>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter a server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4 items-center">
              <Progress value={progress} />

              <Button type="submit" variant={"primary"} disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
