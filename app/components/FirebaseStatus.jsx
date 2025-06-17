"use client";

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firestore/firebase';
import { Card, CardBody, Chip } from '@heroui/react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function FirebaseStatus() {
    const [status, setStatus] = useState({
        auth: false,
        db: false,
        config: false
    });

    useEffect(() => {
        const checkFirebaseStatus = () => {
            const hasAuth = !!auth;
            const hasDb = !!db;
            const hasConfig = !!(
                process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
                process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
                process.env.NEXT_PUBLIC_FIREBASE_APP_ID
            );

            setStatus({
                auth: hasAuth,
                db: hasDb,
                config: hasConfig
            });
        };

        checkFirebaseStatus();
    }, []);

    const allGood = status.auth && status.db && status.config;

    if (allGood) return null; // Don't show if everything is working

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="shadow-lg border-l-4 border-l-yellow-500">
                <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Firebase Status</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span>Configuration:</span>
                            <Chip 
                                color={status.config ? "success" : "danger"} 
                                size="sm"
                                startContent={status.config ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            >
                                {status.config ? "OK" : "Missing"}
                            </Chip>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3">
                            <span>Authentication:</span>
                            <Chip 
                                color={status.auth ? "success" : "danger"} 
                                size="sm"
                                startContent={status.auth ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            >
                                {status.auth ? "OK" : "Failed"}
                            </Chip>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3">
                            <span>Database:</span>
                            <Chip 
                                color={status.db ? "success" : "danger"} 
                                size="sm"
                                startContent={status.db ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            >
                                {status.db ? "OK" : "Failed"}
                            </Chip>
                        </div>
                    </div>
                    
                    {!status.config && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                            Please update your .env.local file with your Firebase project configuration.
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}