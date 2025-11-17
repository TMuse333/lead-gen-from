import AgentAdviceDashboard from '@/components/client/adviceDashboard/agentAdviceDashboard'
import FlowManager from '@/components/client/flowManager/page'
import React from 'react'






export default function Page() {



    return (
        <main className='bg-blue-100'>
            <FlowManager/>
            <AgentAdviceDashboard/>
        </main>
    )
}