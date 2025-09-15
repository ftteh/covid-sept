import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { healthDeclarationApi, FindAllOptions } from '@/lib/api';
import { HealthDeclaration } from '@/types/health-declaration';

export default function HealthDeclarationList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'temperature'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeclaration, setSelectedDeclaration] = useState<HealthDeclaration | null>(null);

  const queryOptions: FindAllOptions = {
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
    ...(statusFilter && { status: statusFilter as 'pending' | 'approved' | 'rejected' }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['health-declarations', queryOptions],
    queryFn: () => healthDeclarationApi.findAll(queryOptions),
    placeholderData: keepPreviousData,
  });

  const handleSort = (field: 'createdAt' | 'name' | 'temperature') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  const getStatusBadge = (status: HealthDeclaration['status']) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    
    return (
      <span className={clsx('badge', badges[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSortIcon = (field: 'createdAt' | 'name' | 'temperature') => {
    if (sortBy !== field) return null;
    
    return (
      <span className="ml-1 text-gray-400">
        {sortOrder === 'ASC' ? '↑' : '↓'}
      </span>
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load health declarations. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="card-body border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, symptoms, or contact details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'pending' | 'approved' | 'rejected' | '');
                setCurrentPage(1);
              }}
              className="form-select w-auto"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Items per page */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-select w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="spinner h-8 w-8"></div>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No health declarations found.</p>
            {searchTerm || statusFilter ? (
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            ) : null}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Name {getSortIcon('name')}
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('temperature')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Temperature {getSortIcon('temperature')}
                  </button>
                </th>
                <th>Symptoms</th>
                <th>Contact</th>
                <th>Status</th>
                <th>
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Submitted {getSortIcon('createdAt')}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((declaration) => (
                <tr key={declaration.id} className="hover:bg-gray-50">
                  <td className="font-medium text-gray-900">
                    {declaration.name}
                  </td>
                  <td>
                    <span className={clsx(
                      'text-sm font-medium',
                      declaration.temperature >= 37.5 
                        ? 'text-red-600' 
                        : declaration.temperature >= 37.0
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    )}>
                      {declaration.temperature}°C
                    </span>
                  </td>
                  <td>
                    {declaration.hasSymptoms ? (
                      <div>
                        <span className="text-red-600 text-sm font-medium">Yes</span>
                        {declaration.symptoms && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {declaration.symptoms}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">No</span>
                    )}
                  </td>
                  <td>
                    {declaration.hasContact ? (
                      <div>
                        <span className="text-red-600 text-sm font-medium">Yes</span>
                        {declaration.contactDetails && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {declaration.contactDetails}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">No</span>
                    )}
                  </td>
                  <td>
                    {getStatusBadge(declaration.status)}
                  </td>
                  <td className="text-sm text-gray-500">
                    {format(new Date(declaration.createdAt), 'MMM dd, yyyy')}
                    <br />
                    <span className="text-xs">
                      {format(new Date(declaration.createdAt), 'HH:mm')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedDeclaration(declaration)}
                      className="btn-secondary btn-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="card-footer">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, data.total)} of{' '}
              {data.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary btn-sm"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {data.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                disabled={currentPage === data.totalPages}
                className="btn-secondary btn-sm"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDeclaration && (
        <DetailModal 
          declaration={selectedDeclaration} 
          onClose={() => setSelectedDeclaration(null)} 
        />
      )}
    </div>
  );
}

// Simple modal component for viewing declaration details
function DetailModal({ declaration, onClose }: { 
  declaration: HealthDeclaration; 
  onClose: () => void; 
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Health Declaration Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Name:</span> {declaration.name}
              </div>
              <div>
                <span className="font-medium">Temperature:</span> {declaration.temperature}°C
              </div>
              <div>
                <span className="font-medium">Has Symptoms:</span> {declaration.hasSymptoms ? 'Yes' : 'No'}
                {declaration.symptoms && (
                  <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {declaration.symptoms}
                  </div>
                )}
              </div>
              <div>
                <span className="font-medium">Has Contact:</span> {declaration.hasContact ? 'Yes' : 'No'}
                {declaration.contactDetails && (
                  <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {declaration.contactDetails}
                  </div>
                )}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className="ml-2">
                  {declaration.status.charAt(0).toUpperCase() + declaration.status.slice(1)}
                </span>
              </div>
              <div>
                <span className="font-medium">Submitted:</span> {format(new Date(declaration.createdAt), 'PPpp')}
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 