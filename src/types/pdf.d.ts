declare module 'pdfjs-dist' {
  export * from 'pdfjs-dist/types/src/display/api';
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const workerSrc: string;
  export default workerSrc;
}