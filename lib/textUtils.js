export function convertLinksInText(text) {
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}[^\s]*)/gi;
    
    return text.replace(urlRegex, function(url) {
      const urlObj = new URL(url);
      let displayUrl = url;
      
      const baseUrl = urlObj.protocol + '//' + urlObj.hostname;
      
      let pathPart = urlObj.pathname + urlObj.search + urlObj.hash;
      if (pathPart.length > 15) {
        pathPart = pathPart.substring(0, 12) + '...';
      }
      
      displayUrl = baseUrl + pathPart;
      
      const externalLinkIcon = '↗️'; // SVG ikonu kullanabilirsiniz
      
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="website-link">${displayUrl}${externalLinkIcon}</a>`;
    });
  }