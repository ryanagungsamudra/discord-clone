"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";
import { useState } from "react";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

export const NavigationItem = ({ id, imageUrl, name }: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  // Use state to keep track of the image source
  const [imageSrc, setImageSrc] = useState(
    imageUrl || require("@/app/assets/whale.png")
  );
  // Function to handle changing the image source when imageUrl is empty
  const handleImageFallback = () => {
    if (!imageUrl) {
      setImageSrc(require("@/app/assets/whale.png"));
    }
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onClick} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-[20px]",
            params?.serverId === id ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px]",
            params?.serverId === id &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}>
          <Image
            fill
            src={imageSrc}
            alt="Channel"
            className="w-40 h-40 rounded-full object-cover group-hover:rounded-[16px] transition-all overflow-hidden"
            onError={handleImageFallback}
          />
        </div>
      </button>
    </ActionTooltip>
  );
};
