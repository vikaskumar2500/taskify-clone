import React, { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/providers/modal-provider";
const PlatformLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkProvider>
      <Toaster richColors position="bottom-right"/>
      <ModalProvider />
      {children}
    </ClerkProvider>
  );
};

export default PlatformLayout;
