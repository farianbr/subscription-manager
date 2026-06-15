const NotFound = () => {
  return (
    <section className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="m-auto text-center px-4">
          <img src="/404.svg" alt="404" className="mx-auto max-w-xs w-full" />
          <p className="text-sm md:text-base text-muted p-2 mb-4">
            The page you were looking for doesn't exist
          </p>
          <a
            href="/"
            className="inline-block bg-accent hover:bg-accent-hover text-accent-fg rounded-full py-2.5 px-6 font-medium transition-colors"
          >
            Take me home
          </a>
        </div>
      </div>
    </section>
  );
};
export default NotFound;
