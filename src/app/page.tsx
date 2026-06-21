'use client';

import { useState, useEffect } from 'react';
import { TabBar } from '@/components/layout/TabBar';
import { IframeTab } from '@/components/layout/IframeTab';
import { NasTab } from '@/components/nas/NasTab';
import { InfoTab } from '@/components/info/InfoTab';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth, setupAuthListener } from '@/hooks/useAuth';

const TABS = ['NAS', 'DROPPY', 'ARIA2', 'XUNLEI', 'INFO'] as const;
type Tab = (typeof TABS)[number];

const IFRAME_TABS = ['DROPPY', 'ARIA2', 'XUNLEI'] as const;
type IframeTabKey = (typeof IFRAME_TABS)[number];

const IFRAME_URLS: Record<IframeTabKey, string> = {
  DROPPY: '/droppy/',
  ARIA2: '/aria2/',
  XUNLEI: '/xunlei/',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('NAS');
  const [mountedIframeTabs, setMountedIframeTabs] = useState<Set<IframeTabKey>>(new Set());
  const { showModal, toast, showToast, openAuth, onAuthSuccess, onAuthCancel } = useAuth();

  useEffect(() => {
    return setupAuthListener(showToast, openAuth);
  }, [showToast, openAuth]);

  useEffect(() => {
    if ((IFRAME_TABS as readonly string[]).includes(activeTab)) {
      setMountedIframeTabs((prev) => new Set(prev).add(activeTab as IframeTabKey));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <TabBar tabs={[...TABS]} active={activeTab} onChange={(t) => setActiveTab(t as Tab)} />

      <div className="p-4">
        {activeTab === 'NAS' && <NasTab />}
        {IFRAME_TABS.map(
          (tab) =>
            mountedIframeTabs.has(tab) && (
              <div key={tab} className={activeTab === tab ? undefined : 'hidden'}>
                <IframeTab src={IFRAME_URLS[tab]} title={tab} />
              </div>
            ),
        )}
        {activeTab === 'INFO' && <InfoTab />}
      </div>

      {showModal && <AuthModal onSuccess={onAuthSuccess} onCancel={onAuthCancel} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 right-4 z-50 rounded bg-red-500 px-4 py-2 text-sm text-white shadow-lg transition-opacity">
          {toast}
        </div>
      )}

      {/* FloatButton */}
      <button
        onClick={openAuth}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 active:scale-95"
        title="Authorize"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>
    </div>
  );
}
