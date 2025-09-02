// Global axios replacement utility
// This script helps replace all axios imports with api imports
// Run this manually if needed to update all files

const fs = require('fs');
const path = require('path');

const updateFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  let updatedContent = content
    .replace(/import axios from ['"]axios['"];?/g, "import api from '../utils/api';")
    .replace(/import axios from ['"]axios['"];?/g, "import api from '../../utils/api';")
    .replace(/axios\./g, 'api.');
  
  // Replace environment variable usage
  updatedContent = updatedContent.replace(
    /\$\{import\.meta\.env\.VITE_API_URL\}\/([^`]+)`/g,
    '`/$1`'
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated: ${filePath}`);
  }
};

// This is just a reference file - manual updates are safer
console.log('Use this as reference to manually update axios calls to use the api utility');
