export default function DriveButton() {
  return (
    <a
      href="https://drive.google.com/drive/my-drive" // or a file/folder/share link
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-2 rounded bg-blue-600 text-white"
    >
      Open Google Drive
    </a>
  );
}