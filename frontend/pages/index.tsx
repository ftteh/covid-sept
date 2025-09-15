import { useState } from 'react';
import Head from 'next/head';
import {
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import HealthDeclarationForm from '@/components/HealthDeclarationForm';
import HealthDeclarationList from '@/components/HealthDeclarationList';
import StatsCard from '@/components/StatsCard';
import { useQuery } from '@tanstack/react-query';
import { healthDeclarationApi } from '@/lib/api';

type ActiveTab = 'form' | 'records';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['health-declaration-stats'],
    queryFn: healthDeclarationApi.getStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <>
      <Head>
        <title>Health Declaration System</title>
        <meta name="description" content="Submit and manage health declarations for COVID-19 screening" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Health Declaration System</h1>
                  <p className="text-sm text-gray-600">COVID-19 Health Screening Portal</p>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Stats Cards */}
        {stats && !statsLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Submissions"
                value={stats.total}
                icon={DocumentTextIcon}
                color="blue"
              />
              <StatsCard
                title="Pending Review"
                value={stats.pending}
                icon={ChartBarIcon}
                color="yellow"
              />
              <StatsCard
                title="Approved"
                value={stats.approved}
                icon={UserGroupIcon}
                color="green"
              />
              <StatsCard
                title="Today's Submissions"
                value={stats.todaySubmissions}
                icon={HeartIcon}
                color="purple"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('form')}
                className={`${activeTab === 'form'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Submit Declaration
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`${activeTab === 'records'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Records
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'form' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-smooth rounded-lg overflow-hidden">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Health Declaration Form</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Please complete this form accurately. All information is confidential and used for health screening purposes only.
                    </p>
                  </div>
                  <div className="card-body">
                    <HealthDeclarationForm onSuccess={() => {
                      // Optionally switch to records tab after successful submission
                      // setActiveTab('records');
                    }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div>
                <div className="bg-white shadow-smooth rounded-lg overflow-hidden">
                  <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Health Declaration Records</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      View and manage submitted health declarations with search and filtering options.
                    </p>
                  </div>
                  <HealthDeclarationList />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          </div>
        </footer>
      </div>
    </>
  );
} 