import fs from 'fs';
import path from 'path';

// Let's create a simple text representing base64 of "%PDF-1.4"
const testPdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA4MAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjUwIDcwMCBUZCAoSGVsbG8sIFJlc3VtZSBQREYhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOSAwMDAwMCBuIAowMDAwMDAwMDcwIDAwMDAwIG4gCjAwMDAwMDAxMzEgMDAwMDAgbiAKMDAwMDAwMDIyMSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjM1MgolJUVPRgo=';

function testDecoding() {
  try {
    // Decode test base64
    const byteCharacters = atob(testPdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Check header
    const decodedHeader = new TextDecoder().decode(byteArray.slice(0, 8));
    console.log("Decoded Header (should be %PDF-1.4):", decodedHeader);
    
    if (decodedHeader === '%PDF-1.4') {
      console.log("SUCCESS: Base64 decoding works perfectly!");
    } else {
      console.error("FAIL: Decoded header does not match.");
    }
  } catch (err) {
    console.error("Error during decoding:", err);
  }
}

testDecoding();
