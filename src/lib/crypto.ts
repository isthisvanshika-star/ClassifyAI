import {
  base64ToBuffer,
  bufferToBase64,
  importPrivateKey,
  importPublicKey,
} from "./helper";
import { KeyPair } from "./types";

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const privateKeyBuffer = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey,
  );

  return {
    publicKey: bufferToBase64(publicKeyBuffer),
    privateKey: bufferToBase64(privateKeyBuffer),
  };
}

//? ENCRYPT MESSAGE....

export async function encryptMessage(
  plainText: string,
  recipientPublicKey: { userId: string; publicKey: string }[],
): Promise<{
  encryptedContent: string;
  encryptedKeys: { recipientId: string; encryptedKey: string }[];
}> {
  //? Generate a random AES-GCM 256 key for the message...
  const aesKey = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
  //? Encrypt the message content with AES-GCM key....
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plainText);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encodedText,
  );
  //? Combine iv and ciphertext.... so we can split on decrypt....
  const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);
  const encryptedContent = bufferToBase64(combined.buffer);

  //? Export  AES key as raw bytes....
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

  //? Encrypt the AES key separately for each recipient using their RSA public key....
  const encryptedKeys = await Promise.all(
    recipientPublicKey.map(async ({ userId, publicKey }) => {
      const importedPublicKeys = await importPublicKey(publicKey);
      const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        importedPublicKeys,
        rawAesKey,
      );
      return {
        recipientId: userId,
        encryptedKey: bufferToBase64(encryptedKeyBuffer),
      };
    }),
  );
  return { encryptedContent, encryptedKeys };
}

//? DECRYPT MESSAGE
export async function decryptMessage(
  encryptedContent: string,
  encryptedKey: string,
  privateKeyBase64: string,
): Promise<string> {
  //?  Import private key....
  const privateKey = await importPrivateKey(privateKeyBase64);

  //?  Decrypt the AES key using RSA private key....
  const encryptedKeyBuffer = base64ToBuffer(encryptedKey);
  const rawAesKey = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyBuffer,
  );

  //? Import the AES key....
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  //? Split iv + ciphertext and decrypt....
  const combined = new Uint8Array(base64ToBuffer(encryptedContent));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    ciphertext,
  );
  return new TextDecoder().decode(decryptedBuffer);
}
