export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-foreground">Loading...</p>
      </div>
    </div>
  );
}
