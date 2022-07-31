function download(csv: string, name: string) {
  const uri = "data:text/csv;charset=utf-8," + csv;
  const encodedUri = encodeURI(uri);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", name);
  document.body.appendChild(link);
  link.click();
}

const CsvDownloader = {
  download,
};

export default CsvDownloader;
