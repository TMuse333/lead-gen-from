"use client"

import FormPage from "@/components/pageComponents/frontendPages/formPage/formPage";
import { migrateExistingFlows } from "@/lib/convert/migrateConversationFlows";
import { useConversationConfigStore } from "@/stores/conversationConfigStore";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {



  return (
    <FormPage/>
  );
}
