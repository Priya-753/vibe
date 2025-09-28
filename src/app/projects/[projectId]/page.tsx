interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { projectId } = await params;
  return <div>Project ID {projectId}</div>;
};

export default Page;