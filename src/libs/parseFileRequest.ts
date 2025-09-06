// Helper to parse multipart/form-data
export async function parseFileRequest(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.startsWith('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data');
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    throw new Error('No file uploaded');
  }

  return file as File;
}