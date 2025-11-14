import MarketAnalysisDisplay from "@/components/ux/marketAnalysis/marketAnalysis";
import PropertiesDisplay from "@/components/ux/propertyList/propertyList";
import React from "react";





const Page = () => {



    return (
        <>
        <main className="bg-blue-100">
            <MarketAnalysisDisplay/>
            <PropertiesDisplay/>
        </main>
        </>
    )
}

export default Page