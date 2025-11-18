import AgentAdviceDashboard from '@/components/admin/adviceDashboard/agentAdviceDashboard'
import FlowManager from '@/components/admin/conversationEditor/components/promptSection'
import ConversationEditor from '@/components/admin/conversationEditor/conversationEditor'
import React from 'react'






export default function Page() {



    return (
        <main className='bg-blue-100'>
           <ConversationEditor/>
            <AgentAdviceDashboard/>
        </main>
    )
}