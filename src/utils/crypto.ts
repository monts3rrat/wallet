// src\utils\crypto.ts

export const encryptPrivateKey = async (privateKey: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);
  const passwordKey = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    'raw',
    passwordKey,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    data
  );
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...result));
};

export const decryptPrivateKey = async (encryptedData: string, password: string): Promise<string> => {
  const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const encrypted = data.slice(28);

  const encoder = new TextEncoder();
  const passwordKey = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    'raw',
    passwordKey,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
