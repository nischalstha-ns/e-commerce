// Client-side compression utilities
export function compressData(data) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  
  // Simple compression using built-in methods
  if (typeof window !== 'undefined' && 'CompressionStream' in window) {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(new TextEncoder().encode(data));
    writer.close();
    
    return reader.read().then(({ value }) => value);
  }
  
  // Fallback: simple string compression
  return data.replace(/(.)\1+/g, (match, char) => {
    return match.length > 3 ? `${char}${match.length}` : match;
  });
}

export function decompressData(compressedData) {
  if (typeof window !== 'undefined' && 'DecompressionStream' in window) {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(compressedData);
    writer.close();
    
    return reader.read().then(({ value }) => 
      new TextDecoder().decode(value)
    );
  }
  
  // Fallback decompression
  return compressedData.replace(/(.)\d+/g, (match, char) => {
    const count = parseInt(match.slice(1));
    return char.repeat(count);
  });
}