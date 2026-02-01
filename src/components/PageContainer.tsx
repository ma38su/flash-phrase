import React from 'react';

interface Props {
  children: React.ReactNode;
  maxWidth?: 'xl' | '2xl' | '3xl';
  showTitle?: boolean;
}

const maxWidthClasses = {
  'xl': 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

const PageContainer: React.FC<Props> = ({ children, maxWidth = '3xl', showTitle = false }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 sm:p-8">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {showTitle && (
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-gray-100 tracking-wide drop-shadow-lg">
            Quick Response
          </h1>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
