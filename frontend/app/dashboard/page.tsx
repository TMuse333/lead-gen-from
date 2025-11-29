import UserDashboard from '@/components/dashboard/user/userDashboard/userDashboard'
import { UserConfigProvider } from '@/contexts/UserConfigContext'
import React from 'react'

export default function Page() {
    return (
        <UserConfigProvider>
            <main className='bg-blue-100'>
                <UserDashboard/>
            </main>
        </UserConfigProvider>
    )
}
